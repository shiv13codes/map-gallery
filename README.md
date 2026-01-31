# Vantage Point - Photo Map Gallery

A React application that creates an interactive map gallery from your geotagged photos. It automatically extracts GPS data from images and plots them on a map, allowing users to explore photography by location.

<img width="2559" height="1439" alt="image" src="https://github.com/user-attachments/assets/889bb03d-31a2-4d7d-b60f-ce3a64e168ca" />


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

### 1. Get your own copy

1. Create an account at GitHub.com if you don't have one.
2. Click the **Fork** button at the top right of this page.
3. Click **Create fork**.
   - You now have your own copy of this project under your account!

### 2. Add your photos

1. In your new repository, navigate to the `public/images` folder.
2. Delete the existing demo photos (optional).
3. Click **Add file** → **Upload files**.
4. Drag and drop your own geotagged photos.
5. Click **Commit changes**.

### 3. Connect to Vercel

1. Create an account at Vercel.com (Log in with GitHub).
2. Click **Add New...** → **Project**.
3. Find your repository and click **Import**.
4. Leave all settings as default (Framework Preset should be **Vite**).
5. Click **Deploy**.
   - Your site is now live with your photos!

### 4. Future Updates

To add more photos later, simply upload them to the `public/images` folder and commit. Vercel will automatically update your site.

### 5. Editing Settings

To change the title or map settings:
1. Go to `src/App.jsx` on GitHub.
2. Click the ✏️ (Pencil Icon) to edit.
3. Modify the `CONFIG` values.
4. Click **Commit changes**.
