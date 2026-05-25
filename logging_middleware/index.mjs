export default async function Log(stack, level, packageName, message) {
  const requestBody = {
    stack: stack,
    level: level,
    package: packageName,
    message: message
  };

  try {
    await fetch("/evaluation-service/logs", {
      method: "POST",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwiZXhwIjoxNzc5NDI5NjQ3LCJpYXQiOjE3Nzk0Mjg3NDcsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI0YzY2ZTI0Yi1jYThhLTRkY2MtODRlMC02NTg0MGQzYTM4MTciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyIGFzaHdpbiBqYXlhY2hhbmRyYW4iLCJzdWIiOiI4MDMzZTBmYi1iNTA5LTQ3OTctODczYS04MjY3YWI1YzExYjQifSwiZW1haWwiOiJoZWxsbG9hanJAZ21haWwuY29tIiwibmFtZSI6InIgYXNod2luIGpheWFjaGFuZHJhbiIsInJvbGxObyI6ImNiLmFpLnU0YWlkMjMwMjkiLCJhY2Nlc3NDb2RlIjoiVll1UXpqIiwiY2xpZW50SUQiOiI4MDMzZTBmYi1iNTA5LTQ3OTctODczYS04MjY3YWI1YzExYjQiLCJjbGllbnRTZWNyZXQiOiJRQ3p3UlBzcHRDdlFkZ1VIIn0.myPlqYMxXqCuq4AsJaCRCdBZpQC15e8ZdU6Lhe7njK0"
      },
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    // Inbuilt language loggers and console logging are strictly prohibited
  }
}
