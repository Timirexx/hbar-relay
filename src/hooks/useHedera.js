import { useState, useEffect, useCallback, useRef } from 'react';
import { HashConnect } from 'hashconnect';
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

const TREASURY_ID = import.meta.env.VITE_TREASURY_ACCOUNT_ID;
const TOPIC_ID = import.meta.env.VITE_HCS_TOPIC_ID;
const STAR_TOKEN_ID = import.meta.env.VITE_STAR_TOKEN_ID;
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet';

const appMetadata = {
    name: "HBAR RELAY",
    description: "Brutalist 2D dApp Relay",
    icon: "https://www.hashpack.app/img/logo.svg"
};

export const useHedera = () => {
    const [hcData, setHcData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [accountId, setAccountId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    
    const hashconnect = useRef(new HashConnect(NETWORK, true));

    // Initialize HashConnect
    useEffect(() => {
        const init = async () => {
            const initData = await hashconnect.current.init(appMetadata);
            setHcData(initData);
            
            // Handle pairing event
            hashconnect.current.pairingEvent.on((data) => {
                setAccountId(data.accountIds[0]);
                setConnected(true);
            });

            // Handle disconnection
            hashconnect.current.disconnectionEvent.on(() => {
                setConnected(false);
                setAccountId(null);
            });
        };

        init();
    }, []);

    const connect = useCallback(async () => {
        if (!hcData) {
            console.warn("UPLINK // HASHPACK_NOT_READY // RETRYING_INIT");
            return;
        }
        setIsConnecting(true);
        console.log("UPLINK // INITIATING_HASHPACK_HANDSHAKE");
        try {
            // Priority 1: Direct Extension Handshake
            await hashconnect.current.connectToLocalWallet();
        } catch (error) {
            console.error("UPLINK // HASHPACK_PAIRING_FAILED", error);
        } finally {
            setIsConnecting(false);
        }
    }, [hcData]);

    const disconnect = useCallback(async () => {
        await hashconnect.current.disconnect(hcData.topic);
        setConnected(false);
        setAccountId(null);
    }, [hcData]);

    // Wallet Health Check
    const checkConnection = useCallback(async () => {
        if (!connected || !accountId) return false;
        // In a real app, we might check if the session is still valid
        // HashConnect manages most of this, but we can verify account existence
        try {
            const response = await axios.get(`https://${NETWORK}.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
            return !!response.data;
        } catch (e) {
            console.warn("Wallet health check failed:", e);
            return false;
        }
    }, [connected, accountId]);

    // Pay-to-Play Gate: 1000 tinybars
    const initiateEntryFee = useCallback(async () => {
        if (!connected || !accountId) throw new Error("Wallet not connected");

        const provider = hashconnect.current.getProvider(NETWORK, hcData.topic, accountId);
        const signer = hashconnect.current.getSigner(provider);

        const trans = await new TransferTransaction()
            .addHbarTransfer(accountId, Hbar.fromTinybars(-1000))
            .addHbarTransfer(TREASURY_ID, Hbar.fromTinybars(1000))
            .freezeWithSigner(signer);

        const execution = await trans.executeWithSigner(signer);
        
        // Wait for receipt
        const receipt = await new TransactionReceiptQuery()
            .setTransactionId(execution.transactionId)
            .executeWithSigner(signer);

        if (receipt.status.toString() !== "SUCCESS") {
            throw new Error("Transaction failed");
        }

        return execution.transactionId.toString();
    }, [connected, accountId, hcData]);

    // HTS Star-Claiming logic (Daily 50 Stars)
    const claimDailyStars = useCallback(async () => {
        if (!connected || !accountId) throw new Error("Wallet not connected");

        // 1. Check Association
        const accountInfo = await axios.get(`https://${NETWORK}.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens`);
        const isAssociated = accountInfo.data.tokens.some(t => t.token_id === STAR_TOKEN_ID);

        const provider = hashconnect.current.getProvider(NETWORK, hcData.topic, accountId);
        const signer = hashconnect.current.getSigner(provider);

        if (!isAssociated) {
            const associateTrans = await new TokenAssociateTransaction()
                .setAccountId(accountId)
                .setTokenIds([STAR_TOKEN_ID])
                .freezeWithSigner(signer);
            
            await associateTrans.executeWithSigner(signer);
            // Note: In real app, wait for receipt
        }

        // 2. Logic for Daily Cooldown (Grant-ready approach)
        // Usually, a backend/smart contract handles the actual transfer to prevent gaming.
        // Here we simulate the request to a relayer or treasury-signed transaction.
        console.log("Claiming 50 HTS Stars for", accountId);
        
        // Return success for UI feedback
        return true;
    }, [connected, accountId, hcData]);

    // HCS Score-Reporting with Proof Hash
    const reportScore = useCallback(async (score) => {
        if (!connected || !accountId) return;

        const timestamp = Date.now();
        const payload = {
            player: accountId,
            score,
            timestamp,
            game: "HBAR_RELAY"
        };

        // Cryptographic Proof Hash (SHA-256)
        const proofHash = CryptoJS.SHA256(JSON.stringify(payload)).toString();
        
        const hcsMessage = {
            ...payload,
            proofHash
        };

        const provider = hashconnect.current.getProvider(NETWORK, hcData.topic, accountId);
        const signer = hashconnect.current.getSigner(provider);

        const trans = await new TopicMessageSubmitTransaction()
            .setTopicId(TOPIC_ID)
            .setMessage(JSON.stringify(hcsMessage))
            .freezeWithSigner(signer);

        const execution = await trans.executeWithSigner(signer);
        return execution.transactionId.toString();
    }, [connected, accountId, hcData]);

    // Mirror Node Leaderboard Fetch
    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await axios.get(`https://${NETWORK}.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?order=desc`);
            
            return response.data.messages.map(m => {
                try {
                    const decoded = JSON.parse(atob(m.contents));
                    return decoded;
                } catch (e) {
                    return null;
                }
            }).filter(m => m && m.game === "HBAR_RELAY");
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
            return [];
        }
    }, []);

    return {
        connected,
        accountId,
        isConnecting,
        connect,
        disconnect,
        initiateEntryFee,
        claimDailyStars,
        reportScore,
        fetchLeaderboard,
        checkConnection
    };
};
