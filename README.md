# Robinson's 3D Printing Service

A responsive, dependency-free GitHub Pages website. Visitors enter a 10-digit confirmation number on `index.html`. A matching number opens `status.html`, showing the order's print stage and pickup or delivery timing. You control the information by editing `orders.json` in GitHub.

## Publish on GitHub Pages

1. Create a repository, for example `robinsons-3d-printing`. A public repository works with GitHub Free.
2. Extract this ZIP. Upload the files **inside** the extracted folder to the repository root; `index.html` must be at the root, not inside another folder. Include `.nojekyll` if your file browser displays it; this site also works with GitHub's default Jekyll processing.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages → Build and deployment**.
5. Select **Deploy from a branch**, select **main** and **/(root)**, then click **Save**.
6. Wait for the Pages deployment to finish. GitHub will show the live URL, normally `https://YOUR-USERNAME.github.io/robinsons-3d-printing/`.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

This package has not been deployed to a GitHub repository for you.

## Try the included sample orders

- `0123456789`: printing, pickup estimate.
- `9876543210`: ready for delivery, delivery window.
- `1111111111`: no matching order.

Remove the sample orders before using the site with customers. To start with no orders, replace the contents of `orders.json` with `{}`.

## Add or update an order

In your GitHub repository, open **orders.json → Edit this file** (the pencil). Replace the sample entries or add your own. Commit your changes and wait for the Pages deployment. Customers can then refresh the status page to see your update.

Example containing one order:

```json
{
  "4827091635": {
    "printName": "Custom phone stand",
    "stage": "printing",
    "statusDetail": "The print is underway. A quality check will follow.",
    "fulfillment": "pickup",
    "readyAt": "Saturday, October 17, 2026 · after 3 PM Pacific",
    "fulfillmentNote": "Estimated pickup time. Please wait for Ready for pickup before collecting.",
    "note": "Thanks for your order!",
    "updatedAt": "October 16, 2026 · 5:30 PM Pacific"
  }
}
```

| Field | What to enter |
| --- | --- |
| The key, e.g. `"4827091635"` | Exactly 10 digits, inside quotes. Use a different number for every order. Leading zeros are supported. Give this number to the customer separately. |
| `printName` | Short description of the item. |
| `stage` | One of the stage values below. |
| `statusDetail` | Your current print update, in your own words. |
| `fulfillment` | `pickup` or `delivery`. |
| `readyAt` | Any clear date/time or time window. Include the time zone. Use `To be confirmed` if unknown. |
| `fulfillmentNote` | Explain whether timing is estimated or confirmed and any non-sensitive instructions. |
| `note` | An optional message from you. |
| `updatedAt` | When you made this update. This is entered manually. |

Supported stages:

| Value in JSON | Customer sees |
| --- | --- |
| `queued` | Order received |
| `printing` | Printing |
| `finishing` | Finishing & checking |
| `ready` | Ready for pickup or Ready for delivery |
| `completed` | Completed |
| `on_hold` | On hold; progress list is hidden and timing reads Timing on hold |
| `cancelled` | Cancelled; progress list is hidden and timing reads Order cancelled |

For multiple orders, separate each order object with a comma. Do not put a comma after the final entry. JSON uses double quotes and does not support comments. Avoid duplicate confirmation numbers. Quotes inside your message must be escaped as `\"`. Optional text fields can be blank; `stage` and `fulfillment` must be valid. The website does not automatically infer progress from a date or send notifications.

When an order is completed, you may change `readyAt` to an actual pickup/delivery time and adjust `fulfillmentNote`. When placing an order on hold or cancelling it, also update the note so any old pickup instructions no longer confuse customers.

## Editing and privacy

There is no customer-editable admin page. Only people with repository write access can publish changes. GitHub provides the owner sign-in and editing interface; the site itself requires no password, database, API key, build step, or paid service.

**All order data in this static website is publicly readable**, including confirmation numbers and notes. The number is a lookup convenience, not authentication. Anyone can download `orders.json`, even if they do not know a confirmation number. Do not include names, phone numbers, home addresses, payment details, or sensitive print descriptions. Send pickup addresses and delivery arrangements separately. A private repository does not, by itself, make the published site or its JSON private. Real private tracking would need an authenticated backend, which GitHub Pages alone does not provide.

## Local testing

The website loads `orders.json` using fetch, so opening `index.html` directly as a file is not enough. From this folder, if Python is installed, run:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. On macOS/Linux you may need `python3` instead of `python`.

## Files

- `index.html`: customer confirmation-number form.
- `status.html`: separate order status page.
- `orders.json`: the file you update to manage orders.
- `app.js`: validation, lookup, rendering, and refresh behavior.
- `styles.css`: responsive styling.
- `icon.svg`: site icon.
- `.nojekyll`: bypasses Jekyll on GitHub Pages.

All asset paths are relative, so the website works both at a domain root and under a repository path. No third-party scripts, fonts, cookies, or analytics are included. Order text is rendered as plain text, not HTML.

## Troubleshooting

- **Order not found:** check the exact 10 digits and whether the latest GitHub deployment has completed.
- **Information unavailable:** check `orders.json` for missing commas/quotes or invalid `stage`/`fulfillment` values. Retry when your internet connection is available.
- **Old status:** wait for the Pages deployment and click Refresh status. The application asks the browser to fetch fresh data, but GitHub deployment/CDN propagation may still take time.
- **404:** check that `index.html` is at the selected publishing root and that the Pages branch/folder is correct.
