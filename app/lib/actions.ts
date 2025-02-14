"use server";

// zod를 사용하는 이유
// 1. 타입스크립트는 컴파일 시점의 타입에러만 잡아냄 런타임 단계에서는 javaScript 가 작동되기 때문
// 2. 또한 특정 타입의 정수/ 실수 구분이 불가능 한 점 때문에 해당 라이브러리를 사용한다고 함
import { z } from "zod"; // 스키마 선언 및 유효성 검사 라이브러리
import postgres from "postgres";
import { revalidatePath } from "next/cache"; // 브라우저 클라이언트 측 라우터 캐시 지운 후 서버에 대한 새 요청 트리거
import { redirect } from "next/navigation"; // /dashboard/invoices경로가 다시 검증되고 서버에서 최신 데이터를 갱신 후 페이지로 리디렉션

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

//  actions.tsZod를 임포트하고 폼 객체의 모양과 일치하는 스키마를 정의합니다. 이 스키마는 formData데이터베이스에 저장하기 전에 유효성을 검사합니다.
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.", // zod 사용하여 폼 데이터 검증
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  // JavaScript 부동 소수점 오류를 없애고 정확성을 높이기 위해 데이터베이스에 화폐 가치를 센트 단위로 저장하는 것이 좋습니다.
  const amountInCents = amount * 100;
  // 날짜 생성 송장 생성 날짜에 대해 "YYYY-MM-DD" 형식
  const date = new Date().toISOString().split("T")[0];
  // 이제 데이터베이스에 필요한 모든 값이 있으므로 SQL 쿼리를 만들어 새 송장을 데이터베이스에 삽입하고 변수를 전달
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice." + error,
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  // db에 보낼 데이터 정리 후 try/catch 문으로 err문 처리리
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: `Database Error: Failed to Update Invoice, ${error}` };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
