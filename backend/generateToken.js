const jwt = require('jsonwebtoken');

// Simule un user avec un ID (tu peux remplacer par un vrai _id MongoDB existant)
const payload = {
  user: {
    id: '661a0f2e4f18f63db993ee8f'  // <-- Remplace ça avec un vrai ID de ta base si tu veux
  }
};

// Ta clé secrète JWT (même que celle dans .env)
const secret = 'votre_clé_secrète_JWT';  // Remplace ça avec process.env.JWT_SECRET si tu préfères

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Voici ton token JWT :\n');
console.log(token);
