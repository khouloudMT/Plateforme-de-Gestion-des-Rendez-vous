require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// const socketIo = require('socket.io');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
  }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rendezvous', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Debugging: Verify routes are loading
console.log('Before requiring routes');

// Socket.io setup
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });
// app.use((req, res, next) => {
//     req.io = io;
//     next();
//   });
  
// gestion des connexions
// io.on('connection', (socket) => {
// console.log('Socket connected:', socket.id);

// // on peut écouter un event d'authentification ici
// socket.on('joinRoom', (userId) => {
//     socket.join(userId); // join une "room" personnelle basée sur l'id du client
// });

// socket.on('disconnect', () => {
//     console.log('Socket disconnected');
// });
// });


// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const appointments = require('./routes/appointments');
const professionals = require('./routes/professionals'); 
const statsRoutes = require('./routes/stats');


// Debugging: Verify routes loaded
console.log('Routes required:', { auth, users, appointments, professionals });

// Mount routers
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/appointments', appointments);
app.use('/api/professionals', professionals);
app.use('/api/stats', statsRoutes);


// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('frontend/dist'));
    
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


// Update status
const cron = require('node-cron');
const updateAppointmentStatuses = require('./utils/updateStatus');
// cron job chaque 10 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Updating appointment statuses...');
    await updateAppointmentStatuses();
  });