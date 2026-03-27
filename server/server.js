require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const authMiddleware = require('./middlewares/authMiddleware');

const eventsRoutes = require('./routes/events');
const inscriptionsRoutes = require('./routes/inscriptions');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------------
// SWAGGER DOCUMENTATION
// ----------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ----------------------------
// ROUTES PUBLIQUES
// ----------------------------

// login / register
app.use('/api/utilisateurs', utilisateurRoutes);

// events publics (GET)
app.use('/api/events', eventsRoutes);


// ----------------------------
// ROUTES PROTÉGÉES
// ----------------------------

app.use('/api/inscriptions', authMiddleware, inscriptionsRoutes);
app.use('/api/users', authMiddleware, userRoutes);


// ----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});