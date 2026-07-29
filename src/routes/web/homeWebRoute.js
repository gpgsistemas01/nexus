import express from 'express';

const router = express.Router();

router.get(
    '/',
    (req, res) => {
        if (req.user) return res.redirect('/materiales');

        return res.redirect('/inicio-sesion');
    }
)

export default router;
