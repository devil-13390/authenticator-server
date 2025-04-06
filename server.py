import asyncio
import websockets

connected_clients = set()

async def handler(websocket, path):
    print("Client connected")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            print(f"Received: {message}")
            for client in connected_clients:
                if client != websocket:
                    await client.send(message)
    except:
        pass
    finally:
        connected_clients.remove(websocket)
        print("Client disconnected")

async def main():
    async with websockets.serve(handler, "", 8080):
        await asyncio.Future()  # run forever

asyncio.run(main())
