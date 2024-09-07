# swiggy-export

## Intent
Backup my swiggy order & instamart info

## TODO
- [x] Perform Login
- [x] Extract Orders
- [ ] Extract instamart orders
- [ ] Save them to sqlite

## Setup
1. set env variable `MOBILE_NUMBER`
2. Ensure `nix` and `devbox` installed. Run `devbox shell` inside project root.
3. Run `bun index.js`
4. Without `devbox`, rename file to `index.mjs` and run `node index.mjs`