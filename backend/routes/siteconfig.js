const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const jwt = require('jsonwebtoken');

function adminOnly(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: 'Non autorisé' });
  try {
    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Réservé à l\'admin' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ message: 'Token invalide' }); }
}

/* GET /api/siteconfig — public */
router.get('/', async (req, res) => {
  try {
    let cfg = await SiteConfig.findOne();
    if (!cfg) cfg = await SiteConfig.create({});
    res.json(cfg);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* PUT /api/siteconfig — admin only */
router.put('/', adminOnly, async (req, res) => {
  try {
    const { telephone, email, adresse, facebook, instagram, youtube, linkedin,
            heroTitre, heroSousTitre,
            stat1Chiffre, stat1Label, stat2Chiffre, stat2Label,
            stat3Chiffre, stat3Label, stat4Chiffre, stat4Label } = req.body;
    let cfg = await SiteConfig.findOne();
    if (!cfg) cfg = new SiteConfig();
    const fields = { telephone, email, adresse, facebook, instagram, youtube, linkedin,
                     heroTitre, heroSousTitre,
                     stat1Chiffre, stat1Label, stat2Chiffre, stat2Label,
                     stat3Chiffre, stat3Label, stat4Chiffre, stat4Label };
    for (const [k,v] of Object.entries(fields)) { if (v !== undefined) cfg[k] = v; }
    await cfg.save();
    res.json({ message: 'Paramètres sauvegardés', config: cfg });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
