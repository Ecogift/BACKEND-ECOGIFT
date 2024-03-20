const express = require('express');
const app = express();
const axios = require('axios');
const crypto = require('crypto');

app.post('/savePoints', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const points = req.body.points;
  
  // Überprüfe, ob der Benutzer verifiziert ist
  db.query('SELECT * FROM users WHERE phoneNumber = ? AND verified = true', [phoneNumber], (error, results) => {
    if (error) {
      console.error('Fehler bei der Datenbankabfrage:', error);
      res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
      return;
    }
    
    if (results.length === 0) {
      res.status(401).json({ error: 'Benutzer nicht verifiziert' });
      return;
    }
    
    // Speichere die Punkte in der Datenbank
    db.query('UPDATE users SET points = points + ? WHERE phoneNumber = ?', [points, phoneNumber], (error) => {
      if (error) {
        console.error('Fehler beim Aktualisieren der Datenbank:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
        return;
      }
      
      // Sende die Punkte an A1
      sendPointsToA1(phoneNumber, points);
      
      res.status(200).json({ message: 'Punkte erfolgreich gespeichert' });
    });
  });
});

function sendPointsToA1(phoneNumber, points) {
  // Generiere einen zufälligen Salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Kombiniere Telefonnummer, Punkte und Salt und berechne den Hash
  const hash = crypto.createHash('sha256').update(phoneNumber + points + salt).digest('hex');
  
  // Sende die gehashten Daten an A1
  axios.post('https://a1api.com/points', {
    phoneNumber: phoneNumber,
    points: points,
    hash: hash,
    salt: salt
  }, {
    headers: {
      'Authorization': 'YOUR_A1_API_KEY'
    }
  })
  .then((response) => {
    console.log('Punkte erfolgreich an A1 gesendet');
  })
  .catch((error) => {
    console.error('Fehler beim Senden der Punkte an A1:', error);
  });
}