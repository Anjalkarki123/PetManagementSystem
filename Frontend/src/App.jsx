
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000/api/pets";

const initialForm = {
  Name: "",
  Age: "",
  TypeOfPet: "",
  Street: "",
  City: "",
  State: "",
  ZipCode: "",
};

export default function App() {
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchPets() {
    const response = await fetch(API);
    if (!response.ok) throw new Error("Unable to load pets.");
    const data = await response.json();
    setPets(data);
  }

  useEffect(() => {
    async function load() {
      try {
        await fetchPets();
      } catch {
        setError("Could not connect to the backend.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.Name.trim() || !form.TypeOfPet.trim()) {
      setError("Pet name and type are required.");
      return;
    }

    if (
      form.Age.trim() === "" ||
      !Number.isInteger(Number(form.Age)) ||
      Number(form.Age) < 0 ||
      Number(form.Age) > 100
    ) {
      setError("Age must be a whole number between 0 and 100.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          Name: form.Name.trim(),
          TypeOfPet: form.TypeOfPet.trim(),
          Age: Number(form.Age),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Unable to save pet. Check the information."
        );
      }

      await fetchPets();
      setForm(initialForm);
      setSuccess("Pet added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredPets = pets.filter((pet) =>
    `${pet.Name} ${pet.TypeOfPet} ${pet.City}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const typeCount = new Set(pets.map((pet) => pet.TypeOfPet)).size;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">P</span>
          <div>
            <strong>Pet Registry</strong>
            <small>Management System</small>
          </div>
        </div>
        <span className="project-label">Database Project</span>
      </header>

      <main className="main-content">
        <div className="page-heading">
          <div>
            <h1>Pet Management</h1>
            <p>Manage registered pets and their information.</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <span>Registered pets</span>
            <strong>{pets.length}</strong>
            <small>Total records</small>
          </div>
          <div className="stat-card">
            <span>Pet types</span>
            <strong>{typeCount}</strong>
            <small>Unique categories</small>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Pet Records</h2>
              <p>All pets currently stored in the database.</p>
            </div>
            <input
              className="search"
              placeholder="Search pets..."
              aria-label="Search pets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Pet name</th>
                  <th>Type</th>
                  <th>Age</th>
                  <th>City</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {filteredPets.map((pet) => (
                  <tr key={pet.PetID}>
                    <td className="muted">#{pet.PetID}</td>
                    <td className="pet-name">{pet.Name}</td>
                    <td>{pet.TypeOfPet}</td>
                    <td>{pet.Age}</td>
                    <td>{pet.City || "—"}</td>
                    <td>{pet.State || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p className="empty">Loading pets...</p>}
            {!loading && filteredPets.length === 0 && (
              <p className="empty">No matching pets found.</p>
            )}
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <h2>Add a New Pet</h2>
              <p>Enter the details below to register a pet.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <label>
                Pet name <span className="required">*</span>
                <input
                  name="Name"
                  value={form.Name}
                  onChange={updateField}
                  placeholder="e.g. Rocky"
                />
              </label>

              <label>
                Pet type <span className="required">*</span>
                <select
                  name="TypeOfPet"
                  value={form.TypeOfPet}
                  onChange={updateField}
                >
                  <option value="">Select type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Age <span className="required">*</span>
                <input
                  name="Age"
                  type="number"
                  min="0"
                  max="100"
                  value={form.Age}
                  onChange={updateField}
                  placeholder="Age in years"
                />
              </label>

              <label>
                Street
                <input
                  name="Street"
                  value={form.Street}
                  onChange={updateField}
                  placeholder="Street address"
                />
              </label>

              <label>
                City
                <input
                  name="City"
                  value={form.City}
                  onChange={updateField}
                  placeholder="City"
                />
              </label>

              <label>
                State
                <input
                  name="State"
                  value={form.State}
                  onChange={updateField}
                  placeholder="State"
                />
              </label>

              <label>
                ZIP code
                <input
                  name="ZipCode"
                  value={form.ZipCode}
                  onChange={updateField}
                  placeholder="ZIP code"
                />
              </label>
            </div>

            {error && <p className="alert error" role="alert">{error}</p>}
            {success && <p className="alert success">{success}</p>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setForm(initialForm);
                  setError("");
                  setSuccess("");
                }}
              >
                Clear form
              </button>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "+ Add Pet"}
              </button>
            </div>
          </form>
        </section>

        <footer>Pet Management System · Database Assignment</footer>
      </main>
    </div>
  );
}
