@echo off
REM ===========================================
REM Terra Nova — Galaxy Image Downloader
REM Downloads 10 public-domain galaxy photos from Wikipedia Commons
REM Run this from the project root: galaxies\download-galaxies.bat
REM ===========================================

cd /d "%~dp0"
echo Downloading galaxy images to %CD%
echo.

REM Each galaxy
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o terra.jpg      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/480px-The_Earth_seen_from_Apollo_17.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o magellan.jpg   "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Large_Magellanic_Cloud.jpg/480px-Large_Magellanic_Cloud.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o sombrero.jpg   "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/M104_ngc4594_sombrero_galaxy_hi-res.jpg/480px-M104_ngc4594_sombrero_galaxy_hi-res.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o triangulum.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/VST_snaps_a_very_detailed_view_of_the_Triangulum_Galaxy.jpg/480px-VST_snaps_a_very_detailed_view_of_the_Triangulum_Galaxy.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o whirlpool.jpg  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/M51Hubble.jpg/480px-M51Hubble.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o sunflower.jpg  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Messier_63_by_Hubble.jpg/480px-Messier_63_by_Hubble.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o milkyway.jpg   "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/ESO-VLT-Laser-phot-33a-07.jpg/480px-ESO-VLT-Laser-phot-33a-07.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o cartwheel.jpg  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/The_Cartwheel_Galaxy_%%28IC_45%%29.jpg/480px-The_Cartwheel_Galaxy_%%28IC_45%%29.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o pinwheel.jpg   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/M101_hires_STScI-PRC2006-10a.jpg/480px-M101_hires_STScI-PRC2006-10a.jpg"
curl -L -A "Mozilla/5.0 TerraNovaDownloader" -o andromeda.jpg  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%%28with_h-alpha%%29.jpg/480px-Andromeda_Galaxy_%%28with_h-alpha%%29.jpg"

echo.
echo === Downloaded files ===
dir *.jpg /B /A-D
echo.
echo If all 10 .jpg files appear above (and each is bigger than 5 KB),
echo the download succeeded. Commit + push to deploy.
echo.
pause
