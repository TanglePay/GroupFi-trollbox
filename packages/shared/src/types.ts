import { MessageResponseItem } from 'iotacat-sdk-core';
export interface ICycle {
    bootstrap(): Promise<void>; // resource allocation and channel connection
    start(): Promise<void>; // start loop
    resume(): Promise<void>; // unpause loop
    
    pause(): Promise<void>; // pause loop
    stop(): Promise<void>; // drain then stop loop with timeout
    destroy(): Promise<void>; // de allocation
}

export interface IRunnable {
    poll(): Promise<boolean>; // return true if should pause
}

export interface StorageAdaptor {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}
// { sender, message, timestamp }
export interface IInboxMessage {
    sender: string;
    message: string;
    timestamp: number;
}
export interface IInboxGroup {
    groupId: string;
    groupName?: string;
    latestMessage?: IInboxMessage;
    lastTimeReadLatestMessageTimestamp?: number;
    unreadCount: number;
}
export interface ICommandBase<T extends number> {
    type: T;
}
export interface IInboxRecommendGroup {
    groupId: string
    groupName: string
    qualifyType: string
}
export { IMessage } from "iotacat-sdk-core";

export interface IOutputCommandBase<T> {
    type: T;
    sleepAfterFinishInMs: number;
}
export interface ICheckPublicKeyCommand extends IOutputCommandBase<1> {
}
export interface IJoinGroupCommand extends IOutputCommandBase<2> {
    groupId: string;
}
export interface ICheckCashBalance extends IOutputCommandBase<3> {
}
// send message to group
export interface ISendMessageCommand extends IOutputCommandBase<4> {
    groupId: string;
    message: string;
}
// fullfillOneMessageLite
export interface IFullfillOneMessageLiteCommand extends IOutputCommandBase<5> {
    message: MessageResponseItem
}
