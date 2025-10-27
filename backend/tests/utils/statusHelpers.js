const isSuccess = (status) => status >= 200 && status < 300;
const isClientError = (status) => status >= 400 && status < 500;
const isServerError = (status) => status >= 500;

module.exports = {
  isSuccess,
  isClientError,
  isServerError,
};
