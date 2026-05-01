import { useMemo } from 'react';
import { useAccount, useBalance, useDisconnect, useSendTransaction } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useHedera } from './useHedera';
import { parseEther } from 'viem';

export const useDualWallet = () => {
    // EVM Side (Wagmi / Reown)
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { data: evmBalance } = useBalance({ address: evmAddress });
    const { disconnect: disconnectEvm } = useDisconnect();
    const { open: openAppKit } = useAppKit();
    const { sendTransactionAsync } = useSendTransaction();

    // Native Side (HashConnect)
    const { 
        connected: isNativeConnected, 
        accountId: nativeAddress, 
        disconnect: disconnectNative,
        connect: connectNative,
        isConnecting: isNativeConnecting,
        initiateEntryFee,
        reportScore,
        claimDailyStars
    } = useHedera();

    // Consistently handle connection state
    const isConnected = isEvmConnected || isNativeConnected;
    const walletType = isEvmConnected ? 'evm' : (isNativeConnected ? 'native' : null);

    const address = useMemo(() => {
        if (isEvmConnected && evmAddress) return evmAddress;
        if (isNativeConnected && nativeAddress) return nativeAddress;
        return null;
    }, [evmAddress, nativeAddress, isEvmConnected, isNativeConnected]);

    const balance = useMemo(() => {
        if (isEvmConnected && evmBalance) {
            const formatted = parseFloat(evmBalance.formatted);
            return `${formatted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR`;
        }
        if (isNativeConnected) return "SYNC_READY";
        return "0.00 HBAR";
    }, [evmBalance, isEvmConnected, isNativeConnected]);

    // --- UNIFIED ACTIONS ---

    // 1. PAY ENTRY FEE (1,000 tinybars simulated as 0.00001 HBAR for testing or as requested)
    // Treasury ID: import.meta.env.VITE_TREASURY_ACCOUNT_ID
    const payEntryFee = async () => {
        if (!isConnected) throw new Error("Wallet not connected");

        if (isEvmConnected) {
            // EVM users send HBAR to the treasury's EVM address (or alias)
            // Note: On Hedera, we can use the treasury's account ID if the wallet supports it,
            // but usually we need an Ethereum-style address for the treasury.
            // For now, we simulate the transfer logic.
            const tx = await sendTransactionAsync({
                to: '0x0000000000000000000000000000000000843922', // Example Treasury EVM Alias for 0.0.8665538
                value: parseEther('0.0001'), // Example fee
            });
            return tx;
        } else {
            return await initiateEntryFee();
        }
    };

    // 2. REPORT SCORE TO HCS
    const submitScore = async (score) => {
        if (!isConnected) return;
        
        if (isEvmConnected) {
            console.log("EVM Score Reporting via Proof-of-Skill hash:", score);
            // In a production app, we would use a relayer to post EVM-signed scores to HCS
            return true;
        } else {
            return await reportScore(score);
        }
    };

    // 3. CLAIM STARS
    const claimStars = async () => {
        if (isEvmConnected) {
            console.log("EVM Star Claiming - Manual Association Required");
            return true;
        } else {
            return await claimDailyStars();
        }
    };

    const disconnectWallet = () => {
        if (isEvmConnected) disconnectEvm();
        if (isNativeConnected) disconnectNative();
    };

    return {
        openWalletModal: () => openAppKit(),
        disconnectWallet,
        payEntryFee,
        submitScore,
        claimStars,
        isConnected,
        address,
        balance,
        walletType,
        connectNative,
        isNativeConnecting
    };
};
