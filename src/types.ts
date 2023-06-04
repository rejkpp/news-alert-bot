export type Message = {
    message_id: number;
    from?: User;
    chat: Chat;
    date: number;
    text?: string;
    entities?: Entity[];
    reply_markup?: ReplyMarkup;
};

export type User = {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
    language_code?: string;
};

export type Chat = {
    id: number;
    first_name?: string;
    username?: string;
    type: 'private' | 'group' | 'supergroup' | 'channel';
};

export type Entity = {
    offset: number;
    length: number;
    type:
    | 'bot_command'
    | 'mention'
    | 'hashtag'
    | 'url'
    | 'bold'
    | 'italic'
    | 'code'
    | 'pre'
    | 'text_link'
    | 'text_mention'
    | 'email'
    | 'cashtag'
    | 'phone_number'
    | 'underline'
    | 'strikethrough'
    | 'spoiler'
    | 'custom_emoji';
};

export type ReplyMarkup = {
    keyboard?: KeyboardButton[][];
    inline_keyboard?: InlineKeyboardButton[][];
    resize_keyboard?: boolean;
    force_reply?: boolean;
    selective?: boolean;
    remove_keyboard?: boolean;
    one_time_keyboard?: boolean;
};

export type InlineKeyboardButton = {
    text: string;
    callback_data?: string;
    url?: string;
};

export type KeyboardButton = {
    text: string;
};


export type SendMessageOptions = {
    parse_mode: 'HTML' | 'Markdown';
    reply_markup: ReplyMarkup;
    reply_to_message_id?: number;
};


export type CallbackQuery = {
    id: string;
    from: User;
    message: Message;
    chat_instance: string;
    data: string;
};


export type ButtonOptions = {
    parse_mode?: any;
    reply_markup?: {
        keyboard?: any[][];
        inline_keyboard?: any[][];
        resize_keyboard?: boolean;
        one_time_keyboard?: boolean;
        force_reply?: boolean;
        selective?: boolean;
    };
    reply_to_message_id?: number;
};

export interface IButtons {
    parse_mode: any;
    reply_markup?: {
        keyboard?: KeyboardButton[][];
        inline_keyboard?: InlineKeyboardButton[][];
        resize_keyboard: boolean;
        force_reply: boolean;
        selective?: boolean;
        one_time_keyboard?: boolean;
    };
    reply_to_message_id?: number;
}
