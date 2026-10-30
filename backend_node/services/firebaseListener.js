// backend_node/services/firebaseListener.js
import { dbFirestore } from '../config/firebase.js';

export const initListenerFirebase = (io) => {
    console.log("🦻 Node.js está escuchando eventos en Firebase Firestore...");

    try {
        dbFirestore.collection('alertas').onSnapshot(
            (snapshot) => {
                snapshot.docChanges().forEach((cambio) => {
                    if (cambio.type === 'added') {
                        const nuevaAlerta = cambio.doc.data();
                        console.log("🔥 Cambio en Firestore detectado:", nuevaAlerta);

                        // Emisión por socket a la sala de agentes
                        io.to('agentes').emit('nueva_alerta_urgente', nuevaAlerta);

                        if (nuevaAlerta.ticketId) {
                            io.to(`ticket_${nuevaAlerta.ticketId}`).emit('nuevo_mensaje', nuevaAlerta);
                        }
                    }
                });
            },
            (error) => {
                console.error("⚠️ Error en el listener de Firestore:", error.message);
            }
        );
    } catch (err) {
        console.error("⚠️ No se pudo inicializar el listener de Firebase:", err.message);
    }
};
