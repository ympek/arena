/*
 * Copyright (c) 2010-2017 Nathan Rajlich
 *
 *  Permission is hereby granted, free of charge, to any person
 *  obtaining a copy of this software and associated documentation
 *  files (the "Software"), to deal in the Software without
 *  restriction, including without limitation the rights to use,
 *  copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following
 *  conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *  OTHER DEALINGS IN THE SOFTWARE.
 */

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.util.Collection;

import data.*;
import org.java_websocket.WebSocket;
import org.java_websocket.framing.Framedata;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

/**
 * A simple WebSocketServer implementation. Keeps track of a "chatroom".
 */
public class GameServer extends WebSocketServer {

	ProtocolDecoder protocolDecoder;
	PlayerManager playerManager;
	MessageDispatcher messageDispatcher;

	public GameServer( int port ) throws UnknownHostException {
		super( new InetSocketAddress( port ) );
		try {
			protocolDecoder = new ProtocolDecoder("arenaProtocol.json");
		} catch (IOException e) {
			e.printStackTrace();
		}
		playerManager = new PlayerManager();
		messageDispatcher = new MessageDispatcher(playerManager);
//		THIS MAY CAUSE A PROBLEM WITH READING A FILE FROM THE SAME JAR, NEED TO INVESTIGATE
//
//		String testName = "Szymon Mniejmiec";
//		byte [] testBytes = new byte[65];
//		testBytes[0] = (byte)0x00;
//		for(int i = 1; i<65; i++){
//			testBytes[i] = (byte)0x00;
//			if(i<testName.length()+1) testBytes[i] = (byte)testName.charAt(i-1);
//		}
//		ByteBuffer testBuffer = ByteBuffer.wrap(testBytes);
//		MessageData messageData = protocolDecoder.decodeMessage(testBuffer);
//		System.out.println(messageData.getStringParameter("name").getValue());
//		LOCAL DECODER TEST

	}

	public GameServer( InetSocketAddress address ) {
		super( address );
	}

	@Override
	public void onOpen( WebSocket conn, ClientHandshake handshake ) {
		playerManager.addPlayer(conn.hashCode());
	}

	@Override
	public void onClose( WebSocket conn, int code, String reason, boolean remote ) {
		playerManager.removePlayer(conn.hashCode());
	}

	@Override
	public void onMessage( WebSocket conn, String message ) {
		this.sendToAll( message );
		System.out.println("String Message: " + message );
	}

	@Override 
	public void onMessage( WebSocket conn, ByteBuffer message ) {
		MessageData messageData = protocolDecoder.decodeMessage(message);
		if(GlobalSettings.traces) {
            if (messageData.getMessageName().equals("loginReq") && messageData.getMessageId() == 0) {
                MessageFieldString name = messageData.getStringParameter("name");
                System.out.println("Your name is: " + name.getValue());
            }
        }
		messageDispatcher.handleMessage(conn.hashCode(), messageData);

	}

	@Override
	public void onFragment( WebSocket conn, Framedata fragment ) {
		System.out.println( "received fragment: " + fragment );
	}

	@Override
	public void onError( WebSocket conn, Exception ex ) {
		ex.printStackTrace();
		if( conn != null ) {
			// some errors like port binding failed may not be assignable to a specific websocket
		}
	}

	@Override
	public void onStart() {
		System.out.println("Server started!");
	}

	/**
	 * Sends <var>text</var> to all currently connected WebSocket clients.
	 * 
	 * @param text
	 *            The String to send across the network.
	 * @throws InterruptedException
	 *             When socket related I/O errors occur.
	 */
	public void sendToAll( String text ) {
		Collection<WebSocket> con = connections();
		synchronized ( con ) {
			for( WebSocket c : con ) {
				c.send( text );
			}
		}
	}
}