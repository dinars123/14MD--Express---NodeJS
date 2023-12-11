import express, { Request, Response } from 'express';
type CustomOkPacket = OkPacket & { insertId: number };
import { OkPacket } from 'mysql2';
import bodyParser from 'body-parser';
const cors = require('cors');
// Import the Car type
import { connection } from "./db";
const app = express();
const port = 3001;

type Car = {
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  horsepower: number;
  color: string;
  id: number;
}

app.use(bodyParser.json())

app.use(cors({
  origin: '*'
}));




app.delete('/cars/:id', async (req, res) => {
  try {
    connection.query("DELETE FROM cars WHERE id = ?", [req.params.id], function (err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      const okPacket = result as OkPacket;

      if (okPacket.affectedRows === 0) {
        res.status(404).json({ error: 'Car not found' });
      } else {
        console.log("Number of records deleted: " + okPacket.affectedRows);
        res.json({ deletedCount: okPacket.affectedRows });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/', async (req: Request<{}, {}, {}>, res: Response) => {
  res.json({ message: "Hellooo from server" });
});





app.post('/cars', (req: Request<{}, {}, Car>, res) => {
  console.log('Received POST request with data:', req.body);

  const {make, model, year, fuel_type, horsepower, color} = req.body;

  if(!make || !model || !year || !fuel_type || !horsepower || !color){
    res.status(400).send('invalid car data');
    return
  }
connection.query(
  `INSERT INTO cars (make, model, year, fuel_type, horsepower, color) VALUES (?, ?, ?, ?, ?, ?)`,
  [make, model, year, fuel_type, horsepower, color],
  (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const okPacket = results as OkPacket;

    if (okPacket.insertId !== undefined) {
      const insertedCar: Car = {
        make,
        model,
        year,
        fuel_type,
        horsepower,
        color,
        id: okPacket.insertId,
      };

      res.json({ car: insertedCar });
    } else {
      res.status(500).json({ error: 'Failed to retrieve insertId' });
    }
  }
);
});




app.get('/cars', async (req, res) => {
  connection.query('SELECT * FROM cars', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ cars: results });
  });
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
