/**import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const token = process.env.TOKEN;
const tokenSecret = process.env.TOKEN_SECRET;

const oauth = OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

export async function getSetInfo(setNumber) {
  const normalizedSetNumber = setNumber.includes("-") ? setNumber : `${setNumber}-1`;
  const url = `https://api.bricklink.com/api/store/v1/items/set/${normalizedSetNumber}`;

  const request_data = {
    url,
    method: "GET",
  };

  const authHeader = oauth.toHeader(
    oauth.authorize(request_data, { key: token, secret: tokenSecret })
  );

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/json",
      },
    });

     // --- ¡NUEVA LÓGICA AQUÍ! ---
    // Verificar el meta.code de BrickLink.
    if (response.data && response.data.meta && response.data.meta.code !== 200) {
      // Si BrickLink devuelve un error (ej. 404), lanzamos un error personalizado
      const errorDetails = response.data.meta.description || 'Set no encontrado en BrickLink.';
      const errorCode = response.data.meta.code || 404;
      const error = new Error(errorDetails);
      error.statusCode = errorCode; // Añade un código de estado para manejarlo en server.js
      error.bricklinkDetails = response.data; // Para depuración
      throw error;
    }

    // Si todo está bien, devuelve solo la data útil del set
    return response.data.data; // Asegúrate de que devolvemos `data.data`
  } catch (error) {
    console.error("Error en API BrickLink:", error.response?.data || error.message);
    // Propaga el error para que server.js pueda manejarlo
    throw error;
  }
}*/

// bricklinkApi.js
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import 'dotenv/config'; // Para asegurar que dotenv.config() se ejecuta

// Define las credenciales de Bricklink como un array de objetos
// Esto asume que tienes múltiples pares de tokens/secrets en tus ENV
// Adaptar según cómo las nombres (ej. BRICKLINK_TOKEN_1, BRICKLINK_SECRET_1)
const BRICKLINK_CREDENTIALS = [
  {
    consumerKey: process.env.CONSUMER_KEY, // Asumo que Consumer Key/Secret son los mismos
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_1, // Token para IP_1
    tokenSecret: process.env.TOKEN_SECRET_1, // Secret para IP_1
  },
  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_2, // Token para IP_2
    tokenSecret: process.env.TOKEN_SECRET_2, // Secret para IP_2
  },
  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN_3, // Token para IP_3
    tokenSecret: process.env.TOKEN_SECRET_3, // Secret para IP_3
  },
  // Agrega más si Render te da más de 3 IPs estáticas
].filter(cred => cred.token && cred.tokenSecret);

// Crea la instancia de OAuth
const oauth = OAuth({
  consumer: {
    key: BRICKLINK_CREDENTIALS[0].consumerKey, // Usamos la misma Consumer Key para todos
    secret: BRICKLINK_CREDENTIALS[0].consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// En 0Te-backend/bricklinkApi.js
// ... (resto de tu código hasta la función getSetInfo)

export async function getSetInfo(rawSetNumber) {
    const potentialSetNumbers = [
        rawSetNumber,
        `${rawSetNumber}-1`, // Intentar con el sufijo -1
        // Puedes añadir más sufijos aquí si es necesario
    ].filter(s => s && s.trim() !== '');

    // Recorre cada formato de número de set (ej. "70335", "70335-1")
    for (let currentSetNumberIndex = 0; currentSetNumberIndex < potentialSetNumbers.length; currentSetNumberIndex++) {
        const currentSetNumber = potentialSetNumbers[currentSetNumberIndex];
        if (!currentSetNumber) continue;

        console.log(`getSetInfo: Intentando buscar con número de set: "${currentSetNumber}"`);

        const url = `https://api.bricklink.com/api/store/v1/items/SET/${currentSetNumber}`;
        const requestData = {
            url: url,
            method: 'GET',
            data: null
        };

        // Recorre cada conjunto de credenciales (para las diferentes IPs estáticas)
        for (let i = 0; i < BRICKLINK_CREDENTIALS.length; i++) {
            const { token, tokenSecret } = BRICKLINK_CREDENTIALS[i];
            
            if (!token || !tokenSecret) {
                console.warn(`Saltando intento con credenciales incompletas para el intento de IP ${i+1}.`);
                continue;
            }

            const authorization = oauth.authorize(requestData, {
                key: token,
                secret: tokenSecret
            });

            try {
                const response = await axios({
                    method: requestData.method,
                    url: requestData.url,
                    headers: oauth.toHeader(authorization),
                });

                if (response.status === 200) {
                    console.log("Bricklink API: Éxito con setNumber:", currentSetNumber);
                    if (response.data && response.data.data) {
                        return response.data.data; // ¡Éxito! Devuelve los datos
                    } else {
                        console.warn("Bricklink API: Respuesta 200 pero sin 'data' esperada para setNumber:", currentSetNumber);
                        // Si no hay datos, es un fallo "lógico", salimos del bucle de IPs y probamos el siguiente formato de setNumber
                        break; // Salir del bucle interno (de IPs) e ir al siguiente potentialSetNumber
                    }
                }
            } catch (error) {
                const errorMessage = error.response?.data?.meta?.description || error.response?.data?.message || '';
                const statusCode = error.response?.status;

                console.error(`Intento ${i+1} con ${currentSetNumber} (Token: ${token}) falló: ${statusCode} - ${errorMessage}`);

                // Si es TOKEN_IP_MISMATCHED, intentar con el siguiente token de IP.
                // Si es el último token Y no quedan más formatos de setNumber, entonces sí lanzamos el error.
                if (statusCode === 401 && errorMessage.includes('TOKEN_IP_MISMATCHED')) {
                    if (i === BRICKLINK_CREDENTIALS.length - 1) { // Si es el último token
                        // No podemos hacer más reintentos de IP. Verificamos si hay más formatos de setNumber.
                        if (currentSetNumberIndex < potentialSetNumbers.length - 1) {
                            break; // Salir del bucle de IP para probar el siguiente formato de setNumber
                        } else {
                            // Último token y último formato, no hay más opciones, lanzar el error
                            const bricklinkError = new Error(errorMessage || `Error final: TOKEN_IP_MISMATCHED para ${currentSetNumber}.`);
                            bricklinkError.statusCode = statusCode;
                            bricklinkError.bricklinkDetails = error.response?.data;
                            throw bricklinkError;
                        }
                    }
                    continue; // Intentar el siguiente token de IP para el mismo currentSetNumber
                }

                // Si el error es un "parámetro inválido" o "no encontrado" (400 o 404),
                // y NO es el último formato de setNumber, salimos del bucle de IPs
                // para que el bucle externo (de setNumbers) pueda probar el siguiente formato.
                if ((statusCode === 400 && errorMessage.includes('PARAMETER_MISSING_OR_INVALID')) || statusCode === 404) {
                    if (currentSetNumberIndex < potentialSetNumbers.length - 1) {
                        break; // Salir del bucle de IPs e ir al siguiente potentialSetNumber
                    }
                    // Si es el último formato de setNumber y falla aquí, entonces sí lanzamos el error.
                }
                
                // Si llegamos aquí, es un error que no podemos recuperar
                // O es el último intento (último token, último formato) y falló.
                const bricklinkError = new Error(errorMessage || `Error al obtener información de BrickLink para ${currentSetNumber}.`);
                bricklinkError.statusCode = statusCode;
                bricklinkError.bricklinkDetails = error.response?.data;
                throw bricklinkError;
            }
        }
    }

    // Si la ejecución llega aquí, significa que todos los intentos (todos los setNumbers, todos los tokens) fallaron.
    const finalError = new Error(`No se pudo encontrar el set "${rawSetNumber}" en BrickLink después de todos los intentos.`);
    finalError.statusCode = 404; // Asumimos 404 si no se encuentra
    throw finalError;
}

// Función para obtener la información del set
/*export async function getSetInfo(setNumber) {
    const url = `https://api.bricklink.com/api/store/v1/items/SET/${setNumber}`;

    for (let i = 0; i < BRICKLINK_CREDENTIALS.length; i++) {
        const { token, tokenSecret } = BRICKLINK_CREDENTIALS[i];
        const requestData = {
            url: url,
            method: 'GET',
            data: null
        };

        const authorization = oauth.authorize(requestData, {
            key: token,
            secret: tokenSecret
        });

        try {
            const response = await axios({
                method: requestData.method,
                url: requestData.url,
                headers: oauth.toHeader(authorization),
            });

              // --- AÑADE ESTO ---
             console.log("Bricklink API: Respuesta exitosa recibida:", response.data);
              // --- FIN AÑADE ESTO ---

            // Si la respuesta es exitosa, devolvemos los datos
            if (response.status === 200) {
                return response.data.data; // Asumo que los datos están en response.data.data
            }
        } catch (error) {
            console.error(`Attempt ${i+1} failed with token ${token}:`, error.response?.data || error.message);

            // Si es un error 401 y el mensaje es TOKEN_IP_MISMATCHED,
            // y no es el último intento, continuamos al siguiente token.
            const errorMessage = error.response?.data?.meta?.description || error.response?.data?.message || '';
            if (error.response?.status === 401 && errorMessage.includes('TOKEN_IP_MISMATCHED') && i < BRICKLINK_CREDENTIALS.length - 1) {
                continue; // Intenta con el siguiente par de credenciales
            }

            // Si es el último intento o un error diferente, lanzamos el error
            const statusCode = error.response?.status || 500;
            const message = error.response?.data?.meta?.message || error.response?.data?.description || "Error al obtener información de BrickLink";
            const bricklinkDetails = error.response?.data || null;

            const bricklinkError = new Error(message);
            bricklinkError.statusCode = statusCode;
            bricklinkError.bricklinkDetails = bricklinkDetails;
            throw bricklinkError;
        }
    }

    // Si todos los intentos fallan
    const finalError = new Error("Todos los intentos para conectar con BrickLink fallaron. TOKEN_IP_MISMATCHED o error desconocido.");
    finalError.statusCode = 500;
    throw finalError;
}*/