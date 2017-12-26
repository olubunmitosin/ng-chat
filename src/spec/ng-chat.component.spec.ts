import { NgChat } from '../ng-chat/ng-chat.component';
import { User } from '../ng-chat/core/user';
import { Window } from '../ng-chat/core/window';
import { ChatAdapter } from '../ng-chat/core/chat-adapter';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Message } from '../ng-chat/core/message';

class MockableAdapter extends ChatAdapter {
    public listFriends(): Observable<User[]> {
        throw new Error("Method not implemented.");
    }
    public getMessageHistory(userId: any): Observable<Message[]> {
        throw new Error("Method not implemented.");
    }
    public sendMessage(message: Message): void {
        throw new Error("Method not implemented.");
    }       
}

describe('NgChat', () => {
    beforeEach(function() {
        this.subject = new NgChat();
        this.subject.adapter = new MockableAdapter();
    });

    it('Should have default title', function() {
        expect(this.subject.title).toBe('Friends');
    });

    it('Should have default message placeholder', function() {
        expect(this.subject.messagePlaceholder).toBe('Type a message');
    });

    it('Should have default polling interval', function() {
        expect(this.subject.pollingInterval).toBe(5000);
    });

    it('Must have history enabled by default', function() {
        expect(this.subject.historyEnabled).not.toBeFalsy();
    });

    it('Exercise users filter', function() {
        this.subject.users = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        this.subject.searchInput = 'Test 1';

        const result = this.subject.filteredUsers;

        expect(this.subject.users.length).toBe(2);
        expect(result.length).toBe(1);
    });

    it('Exercise user not found filter', function() {
        this.subject.users = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        this.subject.searchInput = 'Test 3';

        const result = this.subject.filteredUsers;

        expect(this.subject.users.length).toBe(2);
        expect(result.length).toBe(0);
    });

    it('Must display max visible windows on viewport', function() {
        this.subject.viewPortTotalArea = 960; // Just enough for 2 windows based on the default window size of 320

        expect(this.subject.windows.length).toBe(0);

        this.subject.windows = [
            new Window(),
            new Window(),
            new Window()
        ];
        
        this.subject.NormalizeWindows();

        expect(this.subject.windows.length).toBe(2);
    });
    
    it('Must invoke adapter on fetchFriendsList', function() {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(Observable.of([]));

        this.subject.fetchFriendsList();

        expect(MockableAdapter.prototype.listFriends).toHaveBeenCalledTimes(1);
    });

    it('Must update users property when onFriendsListChanged is invoked', function() {
        expect(this.subject.users).toBeUndefined();
        
        this.subject.onFriendsListChanged([
            new User(),
            new User()
        ]);

        expect(this.subject.users.length).toBe(2);
    });

    it('Must return existing open chat window when requesting a chat window instance', function() {
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };
        
        this.subject.windows = [
            {
                chattingTo: user
            }
        ];
        
        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
    });

    it('Must open a new window on a openChatWindow request when it is not opened yet', function(){
        this.subject.historyEnabled = false;
        
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
    });

    it('Must load history from ChatAdapter when opening a window that is not yet opened', function(){
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(MockableAdapter.prototype, 'getMessageHistory').and.returnValue(Observable.of([]));

        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
        expect(MockableAdapter.prototype.getMessageHistory).toHaveBeenCalledTimes(1);
    });
});
