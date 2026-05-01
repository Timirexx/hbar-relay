import { useState, useEffect, useCallback } from 'react';
import { 
    AccountId, 
    TransactionId, 
    TransferTransaction, 
    Hbar, 
    TopicMessageSubmitTransaction,
    TokenAssociateTransaction,
    TransactionReceiptQuery,
    Client
} from '@hashgraph/sdk';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { hcInstance, hcInitData } from '../config/hashconnect';

const TREASURY_ID = import.meta.env.VITE_TREASURY_ACCOUNT_ID;
const TOPIC_ID = import.meta.env.VITE_HCS_TOPIC_ID;
const STAR_TOKEN_ID = import.meta.env.VITE_STAR_TOKEN_ID;
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';

export const useHedera = () => {
    const [connected, setConnected] = useState(false);
    const [accountId, setAccountId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    
    // Subscribe to the Singleton's events
    useEffect(() => {
        const onPairing = (data) => {
            console.log("UPLINK // HASHPACK_PAIRED:", data.accountIds[0]);
            setAccountId(data.accountIds[0]);
            setConnected(true);
        };

        const onDisconnect = () => {
            setConnected(false);
            setAccountId(null);
        };

        hcInstance.pairingEvent.on(onPairing);
        hcInstance.disconnectionEvent.on(onDisconnect);

        return () => {
            hcInstance.pairingEvent.off(onPairing);
            hcInstance.disconnectionEvent.off(onDisconnect);
        };
    }, []);

    const disconnect = useCallback(async () => {
        if (hcInitData) {
            await hcInstance.disconnect(hcInitData.topic);
        }
        setConnected(false);
        setAccountId(null);
    }, []);

    const initiateEntryFee = useCallback(async () => {
        if (!connected || !accountId || !hcInitData) throw new Error("Wallet not connected");

        const provider = hcInstance.getProvider(NETWORK, hcInitData.topic, accountId);
        const signer = hcInstance.getSigner(provider);

        const trans = await new TransferTransaction()
            .addHbarTransfer(accountId, Hbar.fromTinybars(-1000))
            .addHbarTransfer(TREASURY_ID, Hbar.fromTinybars(1000))
            .freezeWithSigner(signer);

        const execution = await trans.executeWithSigner(signer);
        const receipt = await new TransactionReceiptQuery()
            .setTransactionId(execution.transactionId)
            .executeWithSigner(signer);

        if (receipt.status.toString() !== "SUCCESS") throw new Error("Transaction failed");
        return execution.transactionId.toString();
    }, [connected, accountId]);

    const reportScore = useCallback(async (score) => {
        if (!connected || !accountId || !hcInitData) return;

        const payload = { player: accountId, score, timestamp: Date.now(), game: "HBAR_RELAY" };
        const proofHash = CryptoJS.SHA256(JSON.stringify(payload)).toString();
        
        const hcsMessage = { ...payload, proofHash };
        const provider = hcInstance.getProvider(NETWORK, hcInitData.topic, accountId);
        const signer = hcInstance.getSigner(provider);

        const trans = await new TopicMessageSubmitTransaction()
            .setTopicId(TOPIC_ID)
            .setMessage(JSON.stringify(hcsMessage))
            .freezeWithSigner(signer);

        const execution = await trans.executeWithSigner(signer);
        return execution.transactionId.toString();
    }, [connected, accountId]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await axios.get(`https://${NETWORK}.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?order=desc`);
            return response.data.messages.map(m => {
                try { return JSON.parse(atob(m.contents)); } catch (e) { return null; }
            }).filter(m => m && m.game === "HBAR_RELAY");
        } catch (error) {
            return [];
        }
    }, []);

    return {
        connected,
        accountId,
        isConnecting,
        disconnect,
        initiateEntryFee,
        reportScore,
        fetchLeaderboard
    };
};
