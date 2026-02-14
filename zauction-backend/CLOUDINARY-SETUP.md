# Cloudinary Setup Guide

Cloudinary is used for uploading and storing auction and lot images. Follow these steps to configure it:

## Quick Setup

1. **Create a Free Cloudinary Account**
   - Go to https://cloudinary.com/users/register/free
   - Sign up for a free account (includes 25GB storage and 25GB bandwidth/month)

2. **Get Your Credentials**
   - After signing in, go to your Dashboard
   - Copy the following values:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

3. **Add to Environment Variables**
   - Open `zauction-backend/.env`
   - Update these lines:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name_here
     CLOUDINARY_API_KEY=your_api_key_here
     CLOUDINARY_API_SECRET=your_api_secret_here
     ```

4. **Restart Backend Server**
   ```bash
   npm run dev
   ```

## Testing Image Upload

1. Go to the admin dashboard
2. Create a new auction
3. Select an image file
4. Submit the form
5. The image should upload to Cloudinary and display in the auction

## Temporary Workaround (Without Cloudinary)

If you want to test without setting up Cloudinary:

1. You can create auctions without images - they'll use a placeholder
2. Or manually add image URLs from other sources to the `image_url` field in the database
3. The system will still work, just without the image upload feature

## Folder Structure in Cloudinary

Images are automatically organized:
- `/zauction/auctions/` - Auction cover images
- `/zauction/lots/` - Lot images (when implemented)

Images are automatically optimized (max 1200x800px, auto quality/format).
