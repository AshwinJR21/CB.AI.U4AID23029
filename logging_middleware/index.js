async function Log(stack, level, packageName, message) {
  const requestBody = {
    stack: stack,
    level: level,
    package: packageName,
    message: message
  };

  await fetch("http://20.207.122.201/evaluation-service/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwiZXhwIjoxNzc4MDY1Nzg5LCJpYXQiOjE3NzgwNjQ4ODksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI4N2E4N2I0NC0zMjcwLTQ4Y2MtYTlkMS1lN2Q3NGU2MDE3OGUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyIGFzaHdpbiBqYXlhY2hhbmRyYW4iLCJzdWIiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMifSwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwibmFtZSI6InIgYXNod2luIGpheWFjaGFuZHJhbiIsInJvbGxObyI6ImNiLmFpLnU0YWlkMjMwMjkiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiI0Yzg3OGMwNS04YzRiLTQyZjYtYTk2Mi03YWJlYzI5YzQ0MzMiLCJjbGllbnRTZWNyZXQiOiJlZ1VLTmZVUGhOdXRVWmJSIn0.UId74uf9AeBgw6SyWE4iSY_4d6xHBEaiY9A8ywdzbZc"
    },
    body: JSON.stringify(requestBody)
  });
}

module.exports = Log;
