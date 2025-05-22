import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { FirebaseChatData } from '@/types/ChatTypes'
import { serverTimestamp } from 'firebase/firestore';

export const chatService = async (data: FirebaseChatData) => {
    try {
        await addDoc(collection(db, 'chats'), {
            ...data,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error adding chat:', error);
        throw error;
    }
}


export const getChats = async (userUid: string): Promise<FirebaseChatData[]> => {
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, 'chats'),
                where('userUid', '==', userUid),
                orderBy('timestamp', 'desc')
            )
        );
        const chats = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as FirebaseChatData[];
        return chats;
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
}

export const deleteChat = async (userUid: string) => {
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, 'chats'),
                where('userUid', '==', userUid)
            )
        );

        querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
        });

        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}