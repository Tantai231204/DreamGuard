import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface MessageInputProps {
    message: string;
    onMessageChange: (message: string) => void;
    onSendMessage: () => void;
}

export default function MessageInput({
    message,
    onMessageChange,
    onSendMessage,
}: MessageInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 p-4 border-t border-gray-200 bg-white"
        >
            <div
                className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${isFocused
                        ? 'border-[var(--color-primary)] bg-blue-50/30'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
            >
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:text-[var(--color-primary)] transition-all duration-300 rounded-xl hover:shadow-md"
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:text-[var(--color-primary)] transition-all duration-300 rounded-xl hover:shadow-md"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:text-[var(--color-primary)] transition-all duration-300 rounded-xl hover:shadow-md"
                    >
                        <Smile className="h-4 w-4" />
                    </Button>
                </div>

                {/* Input Field */}
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 h-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                />

                {/* Send Button */}
                <AnimatePresence>
                    {message.trim() ? (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <Button
                                onClick={onSendMessage}
                                disabled={!message.trim()}
                                className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-600 hover:to-[var(--color-primary)] h-9 px-4 shadow-md hover:shadow-lg transition-all"
                            >
                                <Send className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Send</span>
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0"
                                disabled
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Typing Indicator or Tips */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-gray-400 mt-2 ml-1"
            >
                Press Enter to send, Shift + Enter for new line
            </motion.p>
        </motion.div>
    );
}
