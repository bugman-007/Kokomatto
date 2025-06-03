import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import ReviewPopup from "../components/common/ReviewPopup";
import OrdersPage from "../pages/OrdersPage";
import { Modal } from "antd";
import axios from "axios";
import TakePhotoModal from "../components/TakePhotoModal";
import { SERVER_URL } from "../utils/constant";
import GLBModelModal from "../components/GLBModelModal";

const MerchantPortalPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [activeChatTab, setActiveChatTab] = useState("customers");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanningInProgress, setScanningInProgress] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSettingsChatOpen, setIsSettingsChatOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [showTakePhotoModal, setShowTakePhotoModal] = useState(false);
  const [showGLBModal, setShowGLBModal] = useState(false);
  const [glbUrl, setGlbUrl] = useState("");

  // Affiliate related states
  const [isAffiliateApproved, setIsAffiliateApproved] = useState(false);
  const [showAffiliatePopup, setShowAffiliatePopup] = useState(false);

  // Extract the current path from location
  const path = location.pathname;

  const navigateToTab = (tab) => {
    if (tab === "affiliate") {
      // Check if merchant is already an approved affiliate
      if (isAffiliateApproved) {
        // If approved, navigate to affiliate dashboard directly
        navigate("/affiliate/dashboard");
        return;
      } else {
        // If not approved, show the affiliate popup
        setShowAffiliatePopup(true);
        return;
      }
    } else if (path === "/merchants") {
      // We're on the main merchant page, just need to switch tabs without changing URL
      setActiveTab(tab);
    } else {
      // Get the last part of the URL (e.g., /merchants/products -> products)
      setActiveTab(tab);
      navigate(`/merchants/${tab}`);
    }
  };

  // Function to handle "Yes" button in the affiliate popup
  const handleAffiliateSignupClick = () => {
    window.location.href = "https://kokomatto.com/affiliate/signup";
  };

  // Function to handle "No" button in the affiliate popup
  const handleDeclineAffiliate = () => {
    setShowAffiliatePopup(false);
  };

  // Check if user is already an approved affiliate
  useEffect(() => {
    // const payload = {
    //   image_url:
    //     "data:image/jpeg;base64,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",
    // };
    // axios
    //   .post(`${SERVER_URL}/api/imagetomodel`, payload)
    //   .then((res) => {
    //     console.log("Image to model response:", res.data);
    //   });
    // This would typically be an API call to check the merchant's affiliate status
    // For demo purposes, we'll check localStorage

    const affiliateStatus = localStorage.getItem("isAffiliateApproved");
    if (affiliateStatus === "true") {
      setIsAffiliateApproved(true);
    }
  }, []);

  // Get home page URL based on user role
  const getHomePage = () => {
    const userRole = localStorage.getItem("userRole") || "";
    switch (userRole) {
      case "admin":
        return "/admin";
      case "merchant":
        return "/merchants";
      case "affiliate":
        return "/affiliate/dashboard";
      case "user":
      default:
        return "/home";
    }
  };

  const handleLogoClick = () => {
    // Force navigation and refresh
    const homePage = getHomePage();
    window.location.href = homePage; // This will force a full page reload
  };

  // Check authentication
  useEffect(() => {
    if (
      !localStorage.getItem("isAuthenticated") ||
      localStorage.getItem("userRole") !== "merchant"
    ) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Set the active tab based on URL when component mounts or location changes
  useEffect(() => {
    if (location.pathname === "/merchants") {
      setActiveTab("analytics");
    } else if (location.pathname.includes("/merchants/")) {
      const tabFromUrl = location.pathname.split("/merchants/")[1];
      if (
        [
          "analytics",
          "products",
          "orders",
          "billing",
          "settings",
          "support",
          "affiliate",
        ].includes(tabFromUrl)
      ) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [location.pathname]); // Added location.pathname as a dependency

  // Force reload when needed
  useEffect(() => {
    // Listen for popstate events (browser back/forward buttons)
    const handlePopState = () => {
      // Force refresh on browser navigation
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Function to generate and download invoice PDF
  const downloadInvoicePDF = (invoiceId, date, amount) => {
    // In a real app, this would call an API to generate the PDF
    // For demonstration, we'll create a simple data URL to simulate a PDF download

    const companyName = "Fashion Boutique"; // This would come from user data
    const companyAddress = "123 Fashion Street, Suite 101\nNew York, NY 10001";
    const vatNumber = "US123456789";

    // Create a simple text representation (in a real app, use a PDF library)
    const invoiceContent = `
      KOKOMATTO INVOICE
      =====================================
      
      Invoice #: ${invoiceId}
      Date: ${date}
      
      Billed To:
      ${companyName}
      ${companyAddress}
      VAT/Tax ID: ${vatNumber}
      
      =====================================
      
      Subscription: Medium Plan
      Period: Monthly
      Amount: ${amount}
      
      =====================================
      
      TOTAL: ${amount}
      
      =====================================
      
      Thank you for your business!
      Payment processed automatically.
      
      For support: support@kokomatto.com
      www.kokomatto.com
    `;

    // Convert to blob and create download link
    const blob = new Blob([invoiceContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const stats = [
    { id: 1, name: "Total Stores", value: "3" },
    { id: 2, name: "Active Products", value: "47" },
    { id: 3, name: "Total Try-Ons", value: "2,864" },
    { id: 4, name: "Conversion Rate", value: "24.3%" },
  ];

  const recentOrders = [
    {
      id: 1,
      customer: "John Smith",
      product: "Blue Denim Jacket",
      date: "Jun 1, 2023",
      amount: "$89.99",
      status: "Purchased",
    },
    {
      id: 2,
      customer: "Emily Johnson",
      product: "Red Summer Dress",
      date: "May 30, 2023",
      amount: "$59.99",
      status: "Purchased",
    },
    {
      id: 3,
      customer: "Michael Brown",
      product: "Black Leather Boots",
      date: "May 29, 2023",
      amount: "$129.99",
      status: "Abandoned",
    },
    {
      id: 4,
      customer: "Sarah Wilson",
      product: "Casual White T-Shirt",
      date: "May 28, 2023",
      amount: "$24.99",
      status: "Purchased",
    },
    {
      id: 5,
      customer: "David Miller",
      product: "Gray Sweater",
      date: "May 27, 2023",
      amount: "$49.99",
      status: "Abandoned",
    },
  ];

  // Sample chat data
  const customerChats = [
    {
      id: 1,
      name: "Sarah Wilson",
      avatar: "https://placehold.co/32x32",
      unread: 3,
      lastMessage: "Hi, is this dress available in red?",
      time: "10:23 AM",
    },
    {
      id: 2,
      name: "James Thompson",
      avatar: "https://placehold.co/32x32",
      unread: 0,
      lastMessage: "Thanks for the help yesterday!",
      time: "Yesterday",
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "https://placehold.co/32x32",
      unread: 1,
      lastMessage: "When will my order arrive?",
      time: "2 days ago",
    },
    {
      id: 4,
      name: "Michael Rodriguez",
      avatar: "https://placehold.co/32x32",
      unread: 0,
      lastMessage: "The virtual try-on worked great!",
      time: "3 days ago",
    },
  ];

  const supportChats = [
    {
      id: 1,
      name: "Technical Support",
      avatar: "https://placehold.co/32x32",
      unread: 1,
      lastMessage: "We've received your request about the API integration.",
      time: "1 hour ago",
    },
    {
      id: 2,
      name: "Billing Department",
      avatar: "https://placehold.co/32x32",
      unread: 0,
      lastMessage: "Your invoice for June has been processed.",
      time: "Yesterday",
    },
  ];

  // Sample chat messages
  const chatMessages = [
    {
      id: 1,
      sender: "customer",
      message:
        "Hi there! I'm looking at your blue denim jacket. Do you have it in size medium?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "merchant",
      message:
        "Hello! Yes, we do have that in medium. It's one of our most popular items!",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "customer",
      message: "Great! And can I use the 3D try-on with this item?",
      time: "10:33 AM",
    },
    {
      id: 4,
      sender: "merchant",
      message:
        'Absolutely! Just click the "Try On" button on the product page. You can see how it looks with different outfits too.',
      time: "10:35 AM",
    },
    {
      id: 5,
      sender: "customer",
      message: "Perfect, thank you! I'll try that now.",
      time: "10:36 AM",
    },
  ];

  // Handle product scanning
  const startProductScan = () => {
    setShowTakePhotoModal(true);
  };

  const handlePhotoCapture = async (photoDataUrl) => {
    // console.log("Captured photo data URL:", photoDataUrl);
    setShowTakePhotoModal(false);
    setScanningInProgress(true);
    setScanProgress(0);
    setScanComplete(false);

    try {
      const payload = { image_url: photoDataUrl };
      const res = await axios.post(`${SERVER_URL}/api/imagetomodel`, payload);
      // Assume backend returns { glb_url: "https://..." }
      if (res.data && res.data.glb_url) {
        setGlbUrl(res.data.glb_url);
        setShowGLBModal(true);
      }
    } catch (err) {
      Modal.error({
        title: "3D Model Generation Failed",
        content: err.message,
      });
    } finally {
      setScanningInProgress(false);
      setScanProgress(100);
      setScanComplete(true);
      setTimeout(() => setShowReviewPopup(true), 1000);
    }


    // Simulate scanning progress
    // const interval = setInterval(() => {
    //   setScanProgress((prev) => {
    //     const newProgress = prev + Math.floor(Math.random() * 10) + 3;
    //     if (newProgress >= 100) {
    //       clearInterval(interval);
    //       setTimeout(() => {
    //         setScanningInProgress(false);
    //         setScanComplete(true);
    //         setShowReviewPopup(true);
    //       }, 1000);
    //       return 100;
    //     }
    //     return newProgress;
    //   });
    // }, 300);
  };

  // Handle review submission
  const handleReviewSubmit = (reviewData) => {
    // In a real app, you would send this review data to your backend
    console.log("Merchant review submitted:", reviewData);

    // Store review in localStorage for demo purposes
    const existingReviews = JSON.parse(
      localStorage.getItem("merchantReviews") || "[]"
    );
    existingReviews.push(reviewData);
    localStorage.setItem("merchantReviews", JSON.stringify(existingReviews));

    // Close the review popup after submission
    setTimeout(() => {
      setShowReviewPopup(false);
    }, 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Stats */}
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Last 30 days
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <h3 className="mt-8 text-lg leading-6 font-medium text-gray-900">
              Recent Try-Ons
            </h3>
            <div className="mt-4 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Customer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customer}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.product}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {order.date}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.amount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status === "Purchased"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "orders":
        return <OrdersPage />;

      case "products":
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Product Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your products, inventory, and product listings.
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add New Product
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={startProductScan}
                  disabled={scanningInProgress}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 019.07 4h5.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Scan New Product
                </button>
              </div>
            </div>

            {/* Scanning UI */}
            {scanningInProgress && (
              <div className="p-6 bg-gray-100 border-t border-b border-gray-200">
                <div className="max-w-2xl mx-auto text-center">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Scanning Product
                  </h4>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${scanProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scanProgress}% Complete
                    </p>
                  </div>
                  <p className="mt-4 text-gray-600">
                    Please keep the product still and well-lit for best results.
                  </p>
                </div>
              </div>
            )}

            {/* Scan Complete Message */}
            {scanComplete && !scanningInProgress && !showReviewPopup && (
              <div className="p-6 bg-green-50 border-t border-b border-green-200">
                <div className="max-w-2xl mx-auto text-center">
                  <h4 className="text-lg font-medium text-green-800 mb-2">
                    Scan Complete!
                  </h4>
                  <p className="text-green-600">
                    Your product has been successfully scanned and is ready for
                    customization.
                  </p>
                </div>
              </div>
            )}

            {/* Rest of products section */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="w-full md:w-auto flex-1 min-w-0">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search products"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>All Categories</option>
                      <option>Clothing</option>
                      <option>Accessories</option>
                      <option>Footwear</option>
                    </select>

                    <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>All Status</option>
                      <option>In Stock</option>
                      <option>Low Stock</option>
                      <option>Out of Stock</option>
                    </select>

                    <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                      <option>Sort By: Default</option>
                      <option>Name: A-Z</option>
                      <option>Name: Z-A</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Stock: Low to High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        SKU
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Categories
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        id: 1,
                        name: "Blue Fashion Dress",
                        sku: "DRESS-001",
                        price: "$79.99",
                        stock: 28,
                        status: "In Stock",
                        statusColor: "green",
                        categories: ["Clothing", "Women"],
                        image: "https://placehold.co/60x60",
                      },
                      {
                        id: 2,
                        name: "Leather Handbag",
                        sku: "BAG-034",
                        price: "$149.99",
                        stock: 12,
                        status: "Low Stock",
                        statusColor: "yellow",
                        categories: ["Accessories", "Women"],
                        image: "https://placehold.co/60x60",
                      },
                      {
                        id: 3,
                        name: "Men's Running Shoes",
                        sku: "SHOE-089",
                        price: "$129.99",
                        stock: 0,
                        status: "Out of Stock",
                        statusColor: "red",
                        categories: ["Footwear", "Men"],
                        image: "https://placehold.co/60x60",
                      },
                      {
                        id: 4,
                        name: "Casual Cotton T-Shirt",
                        sku: "TSHIRT-102",
                        price: "$29.99",
                        stock: 65,
                        status: "In Stock",
                        statusColor: "green",
                        categories: ["Clothing", "Men"],
                        image: "https://placehold.co/60x60",
                      },
                      {
                        id: 5,
                        name: "Gold Bracelet",
                        sku: "JEWL-205",
                        price: "$249.99",
                        stock: 8,
                        status: "Low Stock",
                        statusColor: "yellow",
                        categories: ["Jewelry", "Accessories"],
                        image: "https://placehold.co/60x60",
                      },
                    ].map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-md"
                                src={product.image}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${product.statusColor}-100 text-${product.statusColor}-800`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.categories.join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">5</span> of{" "}
                      <span className="font-medium">24</span> products
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-indigo-500 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
                        2
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        3
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        8
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900">
                Inventory Management
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Quick access to inventory management tools
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Low Stock Items
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            3 products
                          </div>
                        </dd>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bulk Update
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            Stock & Pricing
                          </div>
                        </dd>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Upload CSV
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Sales Analytics
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            View Reports
                          </div>
                        </dd>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Open Analytics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Subscription Plan
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Current plan
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Professional (5 stores)
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Plan features
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              5 store licenses
                            </span>
                          </div>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              Priority customer support
                            </span>
                          </div>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-green-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              Advanced analytics
                            </span>
                          </div>
                        </li>
                      </ul>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Upgrade options
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Upgrade to Enterprise
                      </button>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer Support
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Connect with our support team through various channels.
              </p>
            </div>

            {/* New Customer Support Section */}
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Phone Support */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">
                        Phone Support
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Available during business hours
                      </p>
                      <div className="mt-3">
                        <a
                          href="tel:+18001234567"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg
                            className="h-4 w-4 mr-2"
                                                       xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Call Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Support */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-green-600"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-base font-medium text-gray-900">
                        WhatsApp Support
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Connect with regional support via WhatsApp
                      </p>

                      {/* Country-based WhatsApp numbers */}
                      <div className="mt-3">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 mr-2">
                              Your Region:
                            </span>
                            <select className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                              <option value="us">
                                United States (English)
                              </option>
                              <option value="ca">
                                Canada (English/French)
                              </option>
                              <option value="mx">Mexico (Spanish)</option>
                              <option value="br">Brazil (Portuguese)</option>
                              <option value="es">Spain (Spanish)</option>
                              <option value="fr">France (French)</option>
                              <option value="de">Germany (German)</option>
                              <option value="it">Italy (Italian)</option>
                              <option value="jp">Japan (Japanese)</option>
                              <option value="cn">China (Chinese)</option>
                            </select>
                          </div>

                          <a
                            href="https://wa.me/18001234567"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg
                              className="h-4 w-4 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Message on WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        <p>
                          WhatsApp support is configured based on your location
                          and language preferences. Support hours may vary by
                          region.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Country/Language IP Association Information */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Regional Support Information
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Our system automatically detects your country based on your IP
                  address and provides region-specific support options.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-800">
                      Detected Information:
                    </h5>
                    <ul className="mt-1 text-gray-600 space-y-1">
                      <li>
                        <span className="font-medium">Country:</span> United
                        States
                      </li>
                      <li>
                        <span className="font-medium">Language:</span> English
                      </li>
                      <li>
                        <span className="font-medium">IP Region:</span> North
                        America
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800">
                      Support Availability:
                    </h5>
                    <ul className="mt-1 text-gray-600 space-y-1">
                      <li>
                        <span className="font-medium">Phone:</span> 24/7
                      </li>
                      <li>
                        <span className="font-medium">WhatsApp:</span> 9AM - 9PM
                        EST
                      </li>
                      <li>
                        <span className="font-medium">Email:</span> 24/7
                        (response within 24h)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Chat Center */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6 mt-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Chat Center
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Communicate with your customers and our support team.
              </p>
            </div>

            <div className="border-t border-gray-200">
              <div className="flex flex-col md:flex-row h-[500px] md:h-[calc(100vh-220px)]">
                {/* Chat sidebar */}
                <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[250px] md:max-h-full md:h-full">
                  <div className="border-b border-gray-200">
                    <div className="flex px-3 py-2">
                      <button
                        onClick={() => setActiveChatTab("customers")}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded ${
                          activeChatTab === "customers"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Customers
                      </button>
                      <button
                        onClick={() => setActiveChatTab("support")}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded ${
                          activeChatTab === "support"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Support
                      </button>
                    </div>

                    <div className="p-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        <svg
                          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {activeChatTab === "customers"
                      ? customerChats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-start ${
                              selectedChat?.id === chat.id ? "bg-gray-50" : ""
                            }`}
                          >
                            <img
                              src={chat.avatar}
                              alt={chat.name}
                              className="h-8 w-8 rounded-full flex-shrink-0"
                            />
                            <div className="ml-3 flex-1 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {chat.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {chat.time}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage}
                              </p>
                            </div>
                            {chat.unread > 0 && (
                              <span className="ml-2 bg-indigo-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {chat.unread}
                              </span>
                            )}
                          </button>
                        ))
                      : supportChats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 flex items-start ${
                              selectedChat?.id === chat.id ? "bg-gray-50" : ""
                            }`}
                          >
                            <img
                              src={chat.avatar}
                              alt={chat.name}
                              className="h-8 w-8 rounded-full flex-shrink-0"
                            />
                            <div className="ml-3 flex-1 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {chat.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {chat.time}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage}
                              </p>
                            </div>
                            {chat.unread > 0 && (
                              <span className="ml-2 bg-indigo-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {chat.unread}
                              </span>
                            )}
                          </button>
                        ))}
                  </div>
                </div>

                {/* Chat content */}
                <div className="flex-1 flex flex-col h-[250px] md:h-full overflow-hidden">
                  {selectedChat ? (
                    <>
                      <div className="border-b border-gray-200 p-2 md:p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={selectedChat.avatar}
                            alt={selectedChat.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {selectedChat.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activeChatTab === "customers"
                                ? "Customer"
                                : "Support Team"}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-indigo-100 text-indigo-600 p-1 md:p-2 rounded-full">
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </button>
                          <button
                            className="bg-indigo-100 text-indigo-600 p-1 md:p-2 rounded-full"
                            title="Start video call (Premium feature)"
                          >
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                          <button className="bg-indigo-100 text-indigo-600 p-1 md:p-2 rounded-full">
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 012 0 1 1 0 110 2 1 1 0 01-2 0zm0 7a1 1 0 110-2 1 1 0 012 0 1 1 0 110 2 1 1 0 01-2 0zm0 7a1 1 0 110-2 1 1 0 012 0 1 1 0 110 2 1 1 0 01-2 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender === "merchant"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                                msg.sender === "merchant"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender === "merchant"
                                    ? "text-indigo-200"
                                    : "text-gray-500"
                                }`}
                              >
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 p-2 md:p-4">
                        <div className="flex items-center">
                          <button className="text-gray-500 p-1 md:p-2 rounded-full hover:text-gray-600 hover:bg-gray-100">
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                          </button>
                          <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 border-0 focus:ring-0 text-sm px-2 md:px-4"
                          />
                          <button className="bg-indigo-600 text-white p-1 md:p-2 rounded-full hover:bg-indigo-700">
                            <svg
                              className="h-4 w-4 md:h-5 md:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center p-4 md:p-6">
                        <svg
                          className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <h3 className="mt-2 text-base md:text-lg font-medium text-gray-900">
                          No chat selected
                        </h3>
                        <p className="mt-1 text-xs md:text-sm text-gray-500">
                          Select a conversation from the sidebar to start
                          chatting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Video Call Premium Feature
              </h3>
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Video Call with Customers
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Your Professional plan includes video call capabilities
                      with your customers. Help them make purchase decisions
                      with real-time consultation.
                    </p>
                    <div className="mt-3">
                      <a
                        href="#"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View video call history{" "}
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Support Resources
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <svg
                      className="h-8 w-8 text-indigo-600 mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <h4 className="mt-2 text-lg font-medium text-gray-900">
                      Knowledge Base
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Find answers to common questions
                    </p>
                    <a
                      href="#"
                      className="mt-3 inline-block text-indigo-600 hover:text-indigo-500"
                    >
                      Browse Articles
                    </a>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <svg
                      className="h-8 w-8 text-indigo-600 mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <h4 className="mt-2 text-lg font-medium text-gray-900">
                      Video Tutorials
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Watch step-by-step instructions
                    </p>
                    <a
                      href="#"
                      className="mt-3 inline-block text-indigo-600 hover:text-indigo-500"
                    >
                      View Tutorials
                    </a>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <svg
                      className="h-8 w-8 text-indigo-600 mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h4 className="mt-2 text-lg font-medium text-gray-900">
                      FAQ
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      Get answers to frequently asked questions
                    </p>
                    <a
                      href="#"
                      className="mt-3 inline-block text-indigo-600 hover:text-indigo-500"
                    >
                      Read FAQ
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help section specifically for tablet and PC views */}
            <div className="border-t border-gray-200 hidden sm:block">
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Need Help?
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-purple-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-purple-800">
                        Direct Support from Our Team
                      </h3>
                      <p className="mt-2 text-md text-purple-700">
                        Our team is ready to assist you with any questions or
                        issues you might have. We're committed to helping your
                        business succeed with our 3D try-on solution.
                      </p>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-purple-800">
                            Contact Methods
                          </h4>
                          <ul className="mt-2 space-y-2 text-sm text-purple-700">
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">Live chat support</span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">
                                Email support: support@3dtry-on.com
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">
                                Phone support: +1 (800) 555-1234
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-800">
                            Support Hours
                          </h4>
                          <ul className="mt-2 space-y-2 text-sm text-purple-700">
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">
                                Monday - Friday: 9AM - 8PM EST
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">
                                Saturday: 10AM - 6PM EST
                              </span>
                            </li>
                            <li className="flex items-start">
                              <svg
                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="ml-2">
                                Sunday: Closed (Emergency support only)
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setActiveChatTab("support");
                            setSelectedChat(supportChats[0]);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Contact Support Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout key={location.pathname}>
      {" "}
      {/* Add key to force re-render */}
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar navigation */}
          <div className="w-full lg:w-64 bg-white shadow-sm lg:border-r lg:border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={handleLogoClick}
                className="flex items-center bg-transparent border-0"
              >
                {/* <img 
                  src="https://i.ibb.co/KjrQ65br/logo.png" 
                  alt="KOKOMATTO" 
                  className="h-8 w-8 mr-3" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.alt = "K";
                    e.target.className = "font-bold text-indigo-600 text-xl mr-3";
                  }}
                /> */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Merchant Portal
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Manage your 3D try-on store
                  </p>
                </div>
              </button>
            </div>

            <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "analytics"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeTab === "analytics"
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "products"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeTab === "products"
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Products
              </button>

              {/* Orders Button */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "orders"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeTab === "orders"
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Orders
              </button>

              {/* Billing Button */}
              <button
                onClick={() => setActiveTab("billing")}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "billing"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    activeTab === "billing"
                      ? "text-indigo-700"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 012 2h8"
                  />
                </svg>
                Billing
              </button>

              {/* Affiliate Dashboard Button */}
              <button
                onClick={() => setActiveTab("affiliate")}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "affiliate"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    activeTab === "affiliate"
                      ? "text-purple-700"
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Affiliate Dashboard
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "settings"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeTab === "settings"
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>

              <button
                onClick={() => setActiveTab("support")}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md w-full ${
                  activeTab === "support"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                }`}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeTab === "support"
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Chat Center
              </button>

              {/* Need Help section placed right after Chat Center */}
              <div className="mt-4 bg-purple-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-purple-800">
                  Need Help?
                </h3>
                <p className="mt-2 text-sm text-purple-700">
                  Our support team is here to help you succeed.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("support");
                    setActiveChatTab("support");
                  }}
                  className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Contact Support
                </button>
              </div>
            </nav>

            {/* Need Help section removed from here */}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
      <TakePhotoModal
        open={showTakePhotoModal}
        onClose={() => setShowTakePhotoModal(false)}
        onCapture={handlePhotoCapture}
      />
      {/* Affiliate Signup Popup */}
      <Modal
        title="Become an Affiliate"
        open={showAffiliatePopup}
        onCancel={handleDeclineAffiliate}
        footer={null}
        width={700}
        centered
      >
        <div className="py-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Conditions for E-commerce Owners
            </h3>
            <p className="text-gray-700 mb-4">
              Do you also want to become an affiliate? Here are the
              requirements:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Do you have a Professional or
                    Enterprise subscription? The affiliate program will be
                    accepted if you have used our API key IN ALL the sites made
                    available by the subscription YOU PURCHASED.
                  </p>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                You must have a Professional or Enterprise subscription to
                qualify.
              </li>
              <li>
                You must have implemented our API key in ALL sites available
                through your subscription.
              </li>
              <li>
                For Basic, Professional, or Enterprise subscriptions, any site
                where our API has been used cannot be used by affiliates for 12
                months.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row-reverse gap-4 mt-8">
            <button
              onClick={handleAffiliateSignupClick}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Yes, I understand and meet the requirements
            </button>
            <button
              onClick={handleDeclineAffiliate}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              No, I'm not interested at the moment
            </button>
          </div>
        </div>
      </Modal>
      {/* Review Popup for Product Scanning */}
      {showReviewPopup && (
        <ReviewPopup
          onClose={() => setShowReviewPopup(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
      <GLBModelModal
        open={showGLBModal}
        onClose={() => setShowGLBModal(false)}
        glbUrl={glbUrl}
      />
    </Layout>
  );
};

export default MerchantPortalPage;
