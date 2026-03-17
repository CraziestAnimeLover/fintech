import { useState, useEffect } from "react";
import { userAPI } from "../services/api";
import { useDebounce } from "use-debounce";

const CompanyDetails = () => {
  const [form, setForm] = useState({
    name: "",
    type: "",
    industry: "",
    website: "",
    description: "",
    country: "",
    state: "",
    city: "",
    district: "",
    postalCode: "",
    fullAddress: "",
    cin: "",
    gst: "",
    pan: "",
    incorporationDate: ""
  });

  const [postOffices, setPostOffices] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [debouncedPin] = useDebounce(form.postalCode, 500);

  // Validation states
  const [errorType, setErrorType] = useState("");
  const [errorGST, setErrorGST] = useState("");
  const [errorPAN, setErrorPAN] = useState("");
  const [errorCIN, setErrorCIN] = useState("");

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      const pin = debouncedPin;
      if (!pin || pin.length !== 6) return;

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          setPostOffices(data[0].PostOffice);
          const po = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: po.Name,
            district: po.District,
            state: po.State,
            country: po.Country,
            fullAddress: po.Name + ", " + po.District
          }));
        } else setPostOffices([]);
      } catch (err) {
        console.error("Failed to fetch location", err);
        setPostOffices([]);
      }
    };

    fetchLocation();
  }, [debouncedPin]);

  const fetchCompany = async () => {
    try {
      const res = await userAPI.getCompany();
      if (res.data.success && res.data.data) {
        setForm(res.data.data);
        setEditMode(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-uppercase PAN, CIN, GST
    if (["pan", "cin", "gst"].includes(name)) value = value.toUpperCase();

    setForm(prev => ({ ...prev, [name]: value }));

    // Live validations
    if (name === "type") setErrorType(value ? "" : "Please select a company type");

    if (name === "gst") {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      setErrorGST(value && !gstRegex.test(value) ? "GST must be 15 characters and valid" : "");
    }

    if (name === "pan") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      setErrorPAN(value && !panRegex.test(value) ? "PAN must be 10 characters and valid" : "");
    }

    if (name === "cin") {
      const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
      setErrorCIN(value && !cinRegex.test(value) ? "CIN must be 21 characters and valid" : "");
    }
  };

  const handlePostOfficeSelect = (e) => {
    const po = postOffices[e.target.value];
    if (!po) return;
    setForm(prev => ({
      ...prev,
      city: po.Name,
      district: po.District,
      state: po.State,
      country: po.Country,
      fullAddress: po.Name + ", " + po.District
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Final validation before submit
  if (!form.type) { setErrorType("Please select a company type"); return; }
  if (errorGST || errorPAN || errorCIN) return;

  setLoading(true);

  try {
    let res;
    if (editMode) res = await userAPI.updateCompany(form);
    else res = await userAPI.createCompany(form);

    if (res.data.success) {
      setMessage("Company details saved successfully");
      setEditMode(false);

      // ✅ Update localStorage: mark KYC as pending
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.kycStatus = "pending";
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    }
  } catch (error) {
    setMessage("Something went wrong");
  }

  setLoading(false);
};

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-6">Company Information</h3>
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit}>

        {/* Company Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <input name="name" placeholder="Company Name" value={form.name} onChange={handleChange} className="border p-2 rounded" disabled={!editMode} />

          <div className="flex flex-col">
            <select name="type" value={form.type} onChange={handleChange} className={`border p-2 rounded ${errorType ? "border-red-500" : ""}`} disabled={!editMode}>
              <option value="">Company Type</option>
              <option value="Private Ltd">Private Ltd</option>
              <option value="LLP">LLP</option>
              <option value="Sole Proprietor">Sole Proprietor</option>
              <option value="Partnership">Partnership</option>
            </select>
            {errorType && <span className="text-red-500 text-sm mt-1">{errorType}</span>}
          </div>

          <input name="industry" placeholder="Industry Type" value={form.industry} onChange={handleChange} className="border p-2 rounded" disabled={!editMode} />
          <input name="website" placeholder="Website URL" value={form.website} onChange={handleChange} className="border p-2 rounded" disabled={!editMode} />
          <textarea name="description" placeholder="Business Description" value={form.description} onChange={handleChange} className="border p-2 rounded md:col-span-2" disabled={!editMode} />
        </div>

        {/* GST / PAN / CIN */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col">
            <input name="gst" placeholder="GST Number" value={form.gst} onChange={handleChange} className={`border p-2 rounded ${errorGST ? "border-red-500" : ""}`} disabled={!editMode} />
            {errorGST && <span className="text-red-500 text-sm mt-1">{errorGST}</span>}
          </div>
          <div className="flex flex-col">
            <input name="pan" placeholder="PAN Number" value={form.pan} onChange={handleChange} className={`border p-2 rounded ${errorPAN ? "border-red-500" : ""}`} disabled={!editMode} />
            {errorPAN && <span className="text-red-500 text-sm mt-1">{errorPAN}</span>}
          </div>
          <div className="flex flex-col">
            <input name="cin" placeholder="CIN Number" value={form.cin} onChange={handleChange} className={`border p-2 rounded ${errorCIN ? "border-red-500" : ""}`} disabled={!editMode} />
            {errorCIN && <span className="text-red-500 text-sm mt-1">{errorCIN}</span>}
          </div>
        </div>

        {/* Address Section */}
        {/* Keep your existing address fields code here */}
         {/* Address Section */}
        <h4 className="text-lg font-semibold mt-8 mb-3">Address</h4>
        <div className="grid md:grid-cols-2 gap-4">

          <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleChange} className="border p-2 rounded" disabled={!editMode} />

          {postOffices.length > 1 && editMode && (
            <select onChange={handlePostOfficeSelect} className="border p-2 rounded md:col-span-2">
              {postOffices.map((po, idx) => (
                <option key={idx} value={idx}>{po.Name}, {po.District}</option>
              ))}
            </select>
          )}

          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="border p-2 rounded" disabled />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="border p-2 rounded" disabled />
          <input name="district" placeholder="District" value={form.district} onChange={handleChange} className="border p-2 rounded" disabled />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="border p-2 rounded" disabled />
          <textarea name="fullAddress" placeholder="Full Address" value={form.fullAddress} onChange={handleChange} className="border p-2 rounded md:col-span-2" disabled />
        </div>

        

        {/* Buttons */}
        {/* <div className="mt-6 flex gap-3">
          {!editMode && <button type="button" onClick={() => setEditMode(true)} className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>}
          {editMode && <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{loading ? "Saving..." : "Update"}</button>}
        </div> */}
      </form>
    </div>
  );
};

export default CompanyDetails;