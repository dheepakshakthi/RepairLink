const Counter = require('../models/Counter');

const generateTicketNo = async (deviceType) => {
  const year = new Date().getFullYear();
  let code = '';
  switch (deviceType.toLowerCase()) {
    case 'mobile': code = 'MOB'; break;
    case 'laptop': code = 'LAP'; break;
    case 'pc': code = 'PC'; break;
    case 'console': code = 'CON'; break;
    default: code = 'UNK'; break;
  }

  const counterId = `ticket_${code.toLowerCase()}_${year}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `TKT-${year}-${code}-${paddedSeq}`;
};

module.exports = generateTicketNo;
