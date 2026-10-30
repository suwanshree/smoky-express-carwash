<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <img src="assets/images/smoky-express-logo.png" alt="Logo" width="90" height="90">
  </a>

<h2 align="center">Smoky Express Car Wash</h2>

  <p align="center">
    Business website for Customers.
    <br />
  </p>
  <p align="center">
    Built by Suwanshree Acharya
    <br />
  </p>
  <a align="center" href="https://github.com/suwanshree">Github Profile</a>
  </p>
</div>

### Temporary location closures

In `assets/js/script.js`, set the location's value in
`TEMPORARY_LOCATION_CLOSURES` to `true` (for example, `sevierville: true`).
All locations default to `false`. Set it back to `false` when the location reopens.
Deploy the updated file through the normal website workflow and reload to see changes.

This shows an amber notice across the site and updates the location's visible
menu status, homepage selector, hours summaries, and location page. The notice
says the location is closed today for a mechanical repair, with reopening expected
tomorrow once repairs are complete. If the expected timing changes, edit
`TEMPORARY_CLOSURE_MESSAGE` in the same file. Regular hours, metadata, and
structured data remain unchanged. Multiple locations can be flagged independently.

### Halloween 2026 hours

The shared script automatically shows 8 AM–6 PM Halloween hours for Sevierville
and Ooltewah on October 31, 2026, using the `America/New_York` calendar date.
Chattanooga remains coming soon. Regular 8 AM–8 PM hours return on November 1,
including in tabs left open overnight (checked every minute and when revisited).
Temporary closures take priority over the Halloween hours. The exception updates
visible hours only; regular hours in metadata and structured data remain unchanged.
