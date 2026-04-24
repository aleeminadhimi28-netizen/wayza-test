import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');
import QRCode from 'qrcode';

/**
 * Generates a unique TOTP secret for a user.
 * @returns {string} The base32 secret.
 */
export const generateSecret = () => {
    return authenticator.generateSecret();
};

/**
 * Generates a QR code data URL for a user to scan into their authenticator app.
 * @param {string} userEmail User's email.
 * @param {string} secret The base32 secret.
 * @returns {Promise<string>} Data URL of the QR code image.
 */
export const generateQRCode = async (userEmail, secret) => {
    const service = 'Wayzza';
    const otpauth = authenticator.keyuri(userEmail, service, secret);
    return await QRCode.toDataURL(otpauth);
};

/**
 * Verifies a TOTP token against a secret.
 * @param {string} token 6-digit code.
 * @param {string} secret The base32 secret.
 * @returns {boolean} True if valid.
 */
export const verifyToken = (token, secret) => {
    return authenticator.check(token, secret);
};
