#!/bin/bash

# Script to sort files in /saved folder into date-based directories (yyyy-mm-dd)
# for dates from yesterday and earlier, using filename date extraction

# Configuration
SAVED_DIR="./saved"
TODAY=$(date +"%Y-%m-%d")
YESTERDAY=$(date -d "yesterday" +"%Y-%m-%d")

# Check if saved directory exists
if [ ! -d "$SAVED_DIR" ]; then
    echo "Error: Directory $SAVED_DIR does not exist"
    exit 1
fi

# Function to extract date from filename
extract_date() {
    local filename=$(basename "$1")
    if [[ $filename =~ ([0-9]{4}-[0-9]{2}-[0-9]{2}) ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo "invalid"
    fi
}

# Process each file in saved directory
for file in "$SAVED_DIR"/*; do
    # Skip directories
    if [ -d "$file" ]; then
        continue
    fi

    # Skip if not a file
    if [ ! -f "$file" ]; then
        continue
    fi

    # Extract date from filename
    file_date=$(extract_date "$file")
    
    # Skip files with invalid dates
    if [ "$file_date" = "invalid" ]; then
        echo "Skipping file with invalid date: $file"
        continue
    fi

    # Check if file date is <= yesterday
    if [[ "$file_date" > "$YESTERDAY" ]]; then
        echo "Skipping file with date after yesterday: $file (date: $file_date)"
        continue
    fi

    # Create directory for the date if it doesn't exist
    target_dir="$SAVED_DIR/$file_date"
    if [ ! -d "$target_dir" ]; then
        mkdir -p "$target_dir"
        echo "Created directory: $target_dir"
    fi

    # Move the file to the target directory
    mv "$file" "$target_dir/"
    echo "Moved file: $file -> $target_dir/"
done

echo "Sorting complete!"