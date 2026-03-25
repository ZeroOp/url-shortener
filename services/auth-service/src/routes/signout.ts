import express from 'express'

const router = express.Router();

router.post('/api/users/signout', (req,res) => {
    // TS complains about assigning null to session, so cast to any
    (req as any).session = null;
    res.send({});
})

export { router as signoutRouter }