async function Log(stack, level, packageName, message) {
  const requestBody = {
    stack: stack,
    level: level,
    package: packageName,
    message: message
  };

  const response = await fetch("http://20.207.122.201/evaluation-service/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
}

module.exports = Log;
