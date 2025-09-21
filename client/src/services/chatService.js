const API_BASE = process.env.REACT_APP_API_BASE || ''; // Empty for relative path

export async function sendChatMessage(message, history = []) {
	const res = await fetch(`${API_BASE}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, history }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Chat API error (${res.status}): ${text}`);
	}
	return res.json();
}
