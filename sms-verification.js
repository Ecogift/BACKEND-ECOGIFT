const express = require('express');
const app = express();
const twilioClient = require('twilio')('YOUR_ACCOUNT_SID', 'YOUR_AUTH_TOKEN');

// Nehmen wir an, du hast eine Datenbank namens "db" mit einer Tabelle "users"

app.post('/register', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  
  // Überprüfe, ob die Telefonnummer bereits registriert ist
  db.query('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber], (error, results) => {
    if (error) {
      console.error('Fehler bei der Datenbankabfrage:', error);
      res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
      return;
    }
    
    if (results.length > 0) {
      res.status(400).json({ error: 'Telefonnummer bereits registriert' });
      return;
    }
    
    // Generiere einen Verifizierungscode
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    // Speichere den Verifizierungscode in der Datenbank
    db.query('INSERT INTO users (phoneNumber, verificationCode) VALUES (?, ?)', [phoneNumber, verificationCode], (error) => {
      if (error) {
        console.error('Fehler beim Einfügen in die Datenbank:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
        return;
      }
      
      // Sende den Verifizierungscode per SMS
      twilioClient.messages.create({
        body: `Dein Verifizierungscode ist: ${verificationCode}`,
        from: 'YOUR_TWILIO_PHONE_NUMBER',
        to: phoneNumber
      })
      .then(() => {
        res.status(200).json({ message: 'Verifizierungscode gesendet' });
      })
      .catch((error) => {
        console.error('Fehler beim Senden der SMS:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
      });
    });
  });
});

app.post('/verify', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const verificationCode = req.body.verificationCode;
  
  // Überprüfe den Verifizierungscode in der Datenbank
  db.query('SELECT * FROM users WHERE phoneNumber = ? AND verificationCode = ?', [phoneNumber, verificationCode], (error, results) => {
    if (error) {
      console.error('Fehler bei der Datenbankabfrage:', error);
      res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
      return;
    }
    
    if (results.length === 0) {
      res.status(400).json({ error: 'Ungültiger Verifizierungscode' });
      return;
    }
    
    // Markiere die Telefonnummer als verifiziert
    db.query('UPDATE users SET verified = true WHERE phoneNumber = ?', [phoneNumber], (error) => {
      if (error) {
        console.error('Fehler beim Aktualisieren der Datenbank:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
        return;
      }
      
      res.status(200).json({ message: 'Telefonnummer erfolgreich verifiziert' });
    });
  });
});