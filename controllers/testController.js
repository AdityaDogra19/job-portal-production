// This controller handles the logic for our test route

const getTestMessage = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test route is working perfectly!',
  });
};

module.exports = {
  getTestMessage,
};
