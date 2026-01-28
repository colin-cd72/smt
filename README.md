# SMT Golf Analytics

Web application for analyzing golf shot data from SMT (Shot Measurement Technology) CSV exports.

## Features

- Upload CSV files with shot data
- View statistics by golfer (ball speed, launch angle, distances)
- Interactive charts: distance by shot, ball speed vs distance, golfer comparison
- Shot details table

## Local Development

```bash
npm install
npm run dev
```

Opens frontend at http://localhost:5173 with API proxy to backend at port 3001.

## CloudPanel Deployment

### 1. Create Node.js Site in CloudPanel

- Site: `smt.4tmrw.net`
- App Port: `3999`
- Node.js version: 20.x

### 2. Clone and Build

```bash
cd /home/smt/htdocs/smt.4tmrw.net
git clone https://github.com/colin-cd72/smt.git .
npm install
npm run build
```

### 3. Start with PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Nginx Configuration

In CloudPanel, set the Nginx vhost to proxy to port 3999:

```nginx
location / {
    proxy_pass http://127.0.0.1:3999;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 50M;
}
```

## CSV Format

The application expects CSV files with these columns (no header row):

1. Timestamp
2. Name of Golfer
3. Hole Number
4. Stroke Number
5. Ball Speed
6. Launch Angle
7. Apex
8. Curve
9. Carry Distance
10. Total Distance
