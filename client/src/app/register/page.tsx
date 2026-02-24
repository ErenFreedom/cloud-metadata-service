"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { api } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        client_name: "",
        addressline1: "",
        city: "",
        state: "",
        pincode: "",
        client_admin_name: "",
        client_admin_email: "",
        client_admin_phone: "",
    });



    type Site = {
        site_name: string;
        site_admin_name: string;
        site_admin_phone: string;
    };

    const [sites, setSites] = useState<Site[]>([
        {
            site_name: "",
            site_admin_name: "",
            site_admin_phone: "",
        },
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSiteChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        const updatedSites = [...sites];

        updatedSites[index] = {
            ...updatedSites[index],
            [name as keyof Site]: value,
        };

        setSites(updatedSites);
    };

    const addSite = () => {
        setSites([
            ...sites,
            { site_name: "", site_admin_name: "", site_admin_phone: "" },
        ]);
    };

    const removeSite = (index: number) => {
        const updatedSites = sites.filter((_, i) => i !== index);
        setSites(updatedSites);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post(
                "/api/clients/register",
                {
                    ...formData,
                    sites,
                }
            );

            const client_uuid = response.data.client_uuid;

            router.push(`/verify?client_uuid=${client_uuid}`);
        } catch (error: any) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 py-20">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-4xl font-semibold mb-14 text-center">
                    Client Registration
                </h1>

                <form onSubmit={handleSubmit} className="space-y-14">

                    {/* Company Section */}
                    <Section title="Company Information">
                        <Input name="client_name" placeholder="Company Name" onChange={handleChange} />
                        <Input name="addressline1" placeholder="Address Line 1" onChange={handleChange} />
                        <Input name="city" placeholder="City" onChange={handleChange} />
                        <Input name="state" placeholder="State" onChange={handleChange} />
                        <Input name="pincode" placeholder="Pincode" onChange={handleChange} />
                    </Section>

                    {/* Admin Section */}
                    <Section title="Admin Information">
                        <Input name="client_admin_name" placeholder="Admin Name" onChange={handleChange} />
                        <Input name="client_admin_email" placeholder="Admin Email" onChange={handleChange} />
                        <Input name="client_admin_phone" placeholder="Admin Phone" onChange={handleChange} />
                    </Section>

                    {/* Sites Section */}
                    <div>
                        <h2 className="text-xl text-neutral-400 mb-6">
                            Site Information
                        </h2>

                        {sites.map((site, index) => (
                            <div
                                key={index}
                                className="border border-neutral-800 p-6 rounded-2xl mb-6 space-y-4 bg-neutral-900"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">
                                        Site {index + 1}
                                    </h3>

                                    {sites.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSite(index)}
                                            className="text-red-400 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <Input
                                    name="site_name"
                                    placeholder="Site Name"
                                    onChange={(e) => handleSiteChange(index, e)}
                                />

                                <Input
                                    name="site_admin_name"
                                    placeholder="Site Admin Name"
                                    onChange={(e) => handleSiteChange(index, e)}
                                />

                                <Input
                                    name="site_admin_phone"
                                    placeholder="Site Admin Phone"
                                    onChange={(e) => handleSiteChange(index, e)}
                                />
                            </div>
                        ))}

                        <div className="mt-6">
                            <Button onClick={addSite}>
                                + Add Another Site
                            </Button>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6">
                        <Button>
                            Proceed to OTP Verification
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h2 className="text-xl text-neutral-400 mb-6">
                {title}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                {children}
            </div>
        </div>
    );
}

function Input({
    name,
    placeholder,
    onChange,
}: {
    name: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <input
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            required
            className="
        w-full
        bg-neutral-900
        border border-neutral-700
        px-4 py-3
        rounded-xl
        focus:outline-none
        focus:border-white
        transition
      "
        />
    );
}