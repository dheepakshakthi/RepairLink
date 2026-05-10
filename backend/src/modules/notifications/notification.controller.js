const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const Notification = require("../../models/Notification");
const ApiError = require("../../utils/ApiError");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { unread, type, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user._id };

  if (unread === "true") filter.isRead = false;
  if (type) filter.type = type;

  const skip = (Number(page) - 1) * Number(limit);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
      "Notifications retrieved",
    ),
  );
});

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { returnDocument: "after" },
  );

  if (!notification) throw new ApiError(404, "Notification not found");

  res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true },
  );

  res.status(200).json(new ApiResponse(200, null, "All marked as read"));
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!notification) throw new ApiError(404, "Notification not found");

  res.status(200).json(new ApiResponse(200, null, "Notification deleted"));
});
