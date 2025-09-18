export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Create signup API
export async function signup(username, password) {
	// POST to /auth/signup
	const res = await fetch(`${API_URL}/auth/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ username, password }),
	});
	
	const data = await res.json();
	return { status: res.status, data };
}

// Create login API
export async function login(username, password) {
	// POST to /auth/login
	const res = await fetch(`${API_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ username, password }),
	});
	
	const data = await res.json();
	return { status: res.status, data };
}

// Create user getting API
export async function fetchMe(token) {
	// GET to /auth/me
	const res = await fetch(`${API_URL}/auth/me`, {
		headers: {
			Authorization: `Bearer ${token}`
		},
	});

	const data = await res.json();
	return { status: res.status, data };
}

// Create color updating API
export async function updateColor(token, color) {
	// PUT to /auth/updatecolor
	const res = await fetch(`${API_URL}/auth/updatecolor`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ backgroundColor: color }),
	});

	const data = await res.json().catch(() => null);
	return { status: res.status, data };
}