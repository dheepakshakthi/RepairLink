const express = require('express');
const authenticate = require('../../middleware/authenticate');
const { uploadMultiple } = require('../../middleware/upload');
const chatController = require('./chat.controller');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', chatController.getMessages);
router.post('/', chatController.sendMessage);
router.post('/attachments', uploadMultiple('attachments', 5), chatController.uploadAttachment);

module.exports = router;
