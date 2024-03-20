const express = require('express');
const app = express();
const axios = require('axios');

app.post('/verifyA1Customer', async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  
  try {
    //bei API integration wird dieser teil überarbeitet 
    const response = await axios.get(`https://a1api.com/customers/${phoneNumber}`, {
      headers: {
        'Authorization': 'YOUR_A1_API_KEY'
      }
    });

    if (response.data.isA1Customer) {
      // Die Telefonnummer gehört zu einem A1-Kunden
      // Markiere den Benutzer in deiner Datenbank als verifiziert
      db.query('UPDATE users SET verified = true WHERE phoneNumber = ?', [phoneNumber], (error) => {
        if (error) {
          console.error('Fehler beim Aktualisieren der Datenbank:', error);
          res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
          return;
        }
        
        res.status(200).json({ message: 'A1-Kunde erfolgreich verifiziert' });
      });
    } else {
      res.status(400).json({ error: 'Die Telefonnummer gehört nicht zu einem A1-Kunden' });
    }
  } catch (error) {
    console.error('Fehler bei der Anfrage an die A1-API:', error);
    res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
  }
});