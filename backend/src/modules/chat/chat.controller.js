const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const chatService = require('./chat.service');

exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.params.ticketId, req.user, req.query);
  res.status(200).json(new ApiResponse(200, messages, 'Messages retrieved'));
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(req.params.ticketId, req.user, req.body);
  res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

exports.uploadAttachment = asyncHandler(async (req, res) => {
  const urls = await chatService.uploadAttachment(req.files);
  res.status(200).json(new ApiResponse(200, { urls }, 'Attachments uploaded'));
});
