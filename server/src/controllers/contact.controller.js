import { asyncHandler } from '../utils/asyncHandler.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { sendContactReceived } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

export const create = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);
  void sendContactReceived(message.toObject()).catch((error) => logger.error(`Contact email failed: ${error.message}`));
  res.status(201).json({ data: { id: message._id, status: message.status } });
});
