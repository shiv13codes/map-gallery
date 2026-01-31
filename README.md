# Vantage Point - Photo Map Gallery

A React application that creates an interactive map gallery from your geotagged photos. It automatically extracts GPS data from images and plots them on a map, allowing users to explore photography by location.

## Features

- **Interactive Mapping**: Powered by Leaflet.js with custom photo markers.
- **Dual Map Layers**: Switch between CartoDB Voyager (Street) and Esri World Imagery (Satellite).
- **Automated Data Pipeline**: A Node.js script scans your images, generates thumbnails, and extracts EXIF GPS coordinates.
- **Responsive Lightbox**: View full-resolution images with location coordinates and links to Google Maps.
- **Performance**: Built on Vite for fast development and production builds.

## Project Structure

- `src/`: React source code.
- `public/images/`: Directory for source images.
- `scripts/generate-map-data.js`: Utility script to process images and generate `photos.json`.
- `public/photos.json`: Generated data file containing image metadata and coordinates.

## Setup & Usage

### 1. Installation

```bash
npm install
```

### 2. Adding Photos

1. Drop your geotagged photos into `public/images`.
2. Run the generation script to create thumbnails and map data:

```bash
node scripts/generate-map-data.js
```

### 3. Development

Start the local development server:

```bash
npm run dev
```

### 4. Build

Build for production:

```bash
npm run build
```

## Configuration

You can customize the map title, default center, and tile providers in `src/App.jsx` under the `CONFIG` object.

## 🚀 Hosting Guide (Non-Technical)

Follow these steps to get your map gallery online for free.

### 1. Put your code on GitHub

1. Create an account at GitHub.com.
2. Create a new repository (click the **+** icon top-right → **New repository**).
3. Name it (e.g., `my-map-gallery`) and click **Create repository**.
4. Upload your project code:
   - Open your terminal in the project folder.
   - Run these commands (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your details):
     ```bash
     # Initialize git (if not already done)
     git init
     git add .
     git commit -m "Initial setup"
     
     # Connect to your new repository
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git push -u origin main
     ```

### 2. Connect to Vercel

1. Create an account at Vercel.com (Log in with GitHub).
2. Click **Add New...** → **Project**.
3. Find your repository and click **Import**.
4. Leave all settings as default (Framework Preset should be **Vite**).
5. Click **Deploy**.

### 3. Updating Your Map

To add new photos later, simply upload them and push!
1. Add photos to `public/images`.
2. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "New photos"
   git push
   ```
3. Vercel will automatically generate the map data and update your live site.
