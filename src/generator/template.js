// FROM
const fromEmail = 'test@example.com'
const fromName = 'Test Sender'

// TO
const to = (row) => `${row.email}`
const toName = (row) => `${row.firstName} ${row.lastName}`

// SUBJECT
const subject = (row) => `Testing, testing, 123 🎙`

// MESSAGE
function message (row) {
  return (`

<p>Dear ${row.firstName},</p>

<p>Lorem ipsom dolor sit amet.</p>

<p>
  Thanks,<br />
  Test Sender
</p>

`).trim()
}

module.exports = {fromEmail, fromName, to, toName, subject, message}
