import { useMemo } from 'react';
import { useAccount, useBalance, useDisconnect, useSendTransaction } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';

export const useDualWallet = () => {
    // Standard Wagmi / AppKit Hooks
    const { address, isConnected } = useAccount();
    const { data: balanceData } = useBalance({ address });
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { sendTransactionAsync } = useSendTransaction();

    // Standardized Balance Formatting
    const formattedBalance = useMemo(() => {
        if (isConnected && balanceData) {
            const val = parseFloat(balanceData.formatted);
            return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR`;
        }
        return "0.00 HBAR";
    }, [balanceData, isConnected]);

    // Standard Transaction Logic
    const payEntryFee = async () => {
        if (!isConnected) throw new Error("Wallet not connected");
        
        // Treasury Address (Example Alias for 0.0.8665538)
        return await sendTransactionAsync({
            to: '0x0000000000000000000000000000000000843922',
            value: parseEther('0.0001'), 
        });
    };

    return {
        openWalletModal: () => open(),
        disconnectWallet: () => disconnect(),
        payEntryFee,
        isConnected,
        address,
        balance: formattedBalance,
        walletType: 'evm' // Now strictly standard EVM/AppKit
    };
};
