# Building JTK Labs Photo Dir Manager

This document provides detailed instructions for building the JTK Labs Photo Dir Manager application into a Windows executable.

## Prerequisites

Before building the application, ensure you have the following installed:

1. **Node.js** (version 14 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for cloning the repository)

## Setting Up the Project

1. Clone or download the repository:
   ```
   git clone <repository-url>
   ```
   Or download and extract the ZIP file from the repository.

2. Navigate to the project directory:
   ```
   cd photo_folder_manager
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Building the Application

### Running as Administrator (Required on Windows)

Building Electron applications on Windows often requires administrator privileges, especially for creating symbolic links. Here's how to run the command prompt as an administrator:

1. Click on the Windows Start menu
2. Type "Command Prompt" or "cmd"
3. Right-click on "Command Prompt" in the search results
4. Select "Run as administrator"
5. Click "Yes" on the User Account Control prompt

### Building the Executable

Once you have an administrator command prompt open:

1. Navigate to your project directory:
   ```
   cd path\to\photo_folder_manager
   ```

2. Run the build command:
   ```
   npm run build
   ```

3. Wait for the build process to complete. This may take several minutes depending on your system.

### Build Output

After a successful build:

1. The executable will be created in the `dist\win-unpacked` directory as `JTK Labs Photo Dir Manager.exe`
2. A portable executable will also be created in the `dist` directory

## Troubleshooting Common Build Issues

### Permission Errors

If you encounter errors like "A required privilege is not held by the client" or "Access is denied":

1. Make sure you're running the command prompt as an administrator
2. Close any running instances of the application
3. Ensure antivirus software isn't blocking the build process

### Node.js Version Issues

If you encounter errors related to Node.js compatibility:

1. Check your Node.js version:
   ```
   node --version
   ```

2. If needed, install a compatible version (14 or higher)

### Missing Dependencies

If you encounter errors about missing dependencies:

1. Delete the `node_modules` folder
2. Run `npm install` again to reinstall all dependencies
3. Try building again with `npm run build`

## Running the Built Application

After building, you can run the application in several ways:

1. Double-click the executable in `dist\win-unpacked\JTK Labs Photo Dir Manager.exe`
2. Use the portable executable in the `dist` directory
3. Use the provided batch file `JTK_Labs_Photo_Dir_Manager.bat` in the project root

## Additional Notes

- The built application includes all features that were present in the source code at build time
- If you make changes to the source code, you'll need to rebuild the application to include those changes
- For development and testing, you can run the application directly from source using `npm start` or the `Run_From_Source.bat` file