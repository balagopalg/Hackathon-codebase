const express = require('express');

const router = express.Router();

const Onboardingcontroler = require('../controller/onboarding')

router.post('/dataonboard',Onboardingcontroler.Postdata);
router.get('/dataretrieve/:hnId',Onboardingcontroler.getDataById);
//router.patch();




module.exports = router;